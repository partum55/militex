# backend/cars/views.py
from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from bson.objectid import ObjectId
import json

from .models import Car
from .serializers import CarSerializer
from .filters import CarFilter, MongoDBFilterBackend
from .parser_integration import import_cars_sync


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return str(obj.seller_id) == str(request.user.id)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [MongoDBFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Override get_permissions to customize permissions per action:
        - Allow anyone to list and retrieve cars
        - Require authentication for create, update, delete
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'my_listings', 
                           'add_images', 'delete_image', 'set_primary_image']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        elif self.action == 'import_from_autoria':
            permission_classes = [IsAdminUser]
        else:
            # Also allow anyone to access these basic actions
            permission_classes = [permissions.AllowAny]
            
        return [permission() for permission in permission_classes]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Enhanced create method to handle file uploads better"""
        debug_info = {
            'Content-Type': request.content_type,
            'POST keys': list(request.POST.keys() if hasattr(request.POST, 'keys') else []),
            'FILES keys': list(request.FILES.keys()),
            'FILES count': len(request.FILES),
        }
        print("Create request debug info:", debug_info)

        # For multipart forms, handle images properly
        if request.content_type and 'multipart/form-data' in request.content_type:
            image_files = request.FILES.getlist('images')
            
            if image_files:
                request.data._mutable = True
                request.data['image_files'] = image_files
                request.data._mutable = False
                print(f"Processed {len(image_files)} images")
        
        # Process the create normally
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Save seller ID and username for MongoDB document
        serializer.save(
            seller_id=str(self.request.user.id),
            seller_username=self.request.user.username
        )

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get the current user's car listings"""
        queryset = self.queryset.filter(seller_id=str(request.user.id))
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def import_from_autoria(self, request):
        """Import cars from auto.ria.com (admin only)"""
        limit = int(request.data.get('limit', 10))

        try:
            count = import_cars_sync(limit=limit, admin_user_id=str(request.user.id))
            return Response({'status': 'success', 'imported': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_images(self, request, pk=None):
        """Add images to an existing car"""
        car = self.get_object()

        # Check permissions
        if str(car.seller_id) != str(request.user.id) and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to add images to this car'},
                            status=status.HTTP_403_FORBIDDEN)

        # Get images from request
        images = request.FILES.getlist('images')
        if not images:
            return Response({'detail': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Process images for MongoDB
        new_images = []
        for image_file in images:
            # For MongoDB we'll handle image storage differently
            # Instead of using ImageField which relies on Django's file storage
            from datetime import datetime
            import os
            
            # Generate image filename and path
            filename = f"{str(ObjectId())}_{image_file.name}"
            image_path = f"car_images/{filename}"
            
            # Save the file to media directory
            from django.conf import settings
            import os
            
            save_path = os.path.join(settings.MEDIA_ROOT, 'car_images')
            os.makedirs(save_path, exist_ok=True)
            
            full_path = os.path.join(save_path, filename)
            with open(full_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)
            
            # Add image to car's image array
            new_image = {
                '_id': ObjectId(),
                'image_path': image_path,
                'is_primary': not car.images,  # Primary if first image
                'uploaded_at': datetime.now(),
            }
            new_images.append(new_image)
        
        # Add new images to car's image array
        if not hasattr(car, 'images'):
            car.images = []
        car.images.extend(new_images)
        car.save()

        # Return updated car
        serializer = self.get_serializer(car)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def delete_image(self, request, pk=None):
        """Delete an image from a car"""
        car = self.get_object()

        # Check permissions
        if str(car.seller_id) != str(request.user.id) and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to delete images from this car'},
                            status=status.HTTP_403_FORBIDDEN)

        # Get image ID from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'detail': 'No image ID provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert string ID to ObjectId for MongoDB
        try:
            obj_id = ObjectId(image_id)
        except:
            return Response({'detail': 'Invalid image ID format'}, status=status.HTTP_400_BAD_REQUEST)

        # Find and remove the image
        was_primary = False
        image_found = False
        
        for i, img in enumerate(car.images):
            if str(img.get('_id')) == str(image_id):
                was_primary = img.get('is_primary', False)
                image_path = img.get('image_path')
                
                # Delete the actual file
                from django.conf import settings
                import os
                full_path = os.path.join(settings.MEDIA_ROOT, image_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
                
                # Remove from array
                car.images.pop(i)
                image_found = True
                break
        
        if not image_found:
            return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # If this was the primary image, set a new primary image if possible
        if was_primary and car.images:
            car.images[0]['is_primary'] = True
        
        car.save()
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def set_primary_image(self, request, pk=None):
        """Set an image as the primary image for a car"""
        car = self.get_object()

        # Check permissions
        if str(car.seller_id) != str(request.user.id) and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to modify this car'},
                            status=status.HTTP_403_FORBIDDEN)

        # Get image ID from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'detail': 'No image ID provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert string ID to ObjectId for MongoDB
        try:
            obj_id = ObjectId(image_id)
        except:
            return Response({'detail': 'Invalid image ID format'}, status=status.HTTP_400_BAD_REQUEST)

        # First, unset all primary images
        image_found = False
        for img in car.images:
            img['is_primary'] = False
            if str(img.get('_id')) == str(image_id):
                img['is_primary'] = True
                image_found = True

        if not image_found:
            return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        car.save()
        return Response({'status': 'success'})