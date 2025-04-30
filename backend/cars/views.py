from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
import json
from bson.objectid import ObjectId

from cars.models import Car, CarImage
from cars.serializers import CarSerializer
from cars.filters import MongoDBFilterBackend  # Updated import
from cars.parser_integration import import_cars_sync
from django.conf import settings

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return str(obj.seller_id) == str(request.user.id)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class CarViewSet(viewsets.ModelViewSet):
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [MongoDBFilterBackend, filters.SearchFilter, filters.OrderingFilter]  # Updated backend
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # For MongoEngine, we use .objects instead of .objects.all()
        return Car.objects
    
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
            permission_classes = [permissions.AllowAny]
            
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(seller_id=self.request.user.id, seller_username=self.request.user.username)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get the current user's car listings"""
        queryset = Car.objects(seller_id=str(request.user.id))
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'])
    def import_from_autoria(self, request):
        """Import cars from auto.ria.com"""
        try:
            limit = int(request.data.get('limit', 5))
            count = import_cars_sync(limit=limit, admin_user_id=request.user.id)
            return Response({'status': 'success', 'count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_images(self, request, pk=None):
        """Add images to a car"""
        car = self.get_object()
        
        # Check permissions
        if str(car.seller_id) != str(request.user.id) and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Process uploaded images
        images = request.FILES.getlist('images')
        if not images:
            return Response({'status': 'error', 'message': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add images to car
        for i, image_file in enumerate(images):
            try:
                # Generate filename and path
                from datetime import datetime
                import os
                
                filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{image_file.name}"
                image_path = f"car_images/{filename}"
                
                # Save file to disk
                import os
                save_path = os.path.join(settings.MEDIA_ROOT, 'car_images')
                os.makedirs(save_path, exist_ok=True)
                
                full_path = os.path.join(save_path, filename)
                with open(full_path, 'wb+') as destination:
                    for chunk in image_file.chunks():
                        destination.write(chunk)
                
                # Add to car's images array
                car.images.append(CarImage(
                    image_path=image_path,
                    is_primary=len(car.images) == 0  # Primary if it's the first image
                ))
            except Exception as e:
                return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        car.save()
        serializer = self.get_serializer(car)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """Delete an image from a car"""
        car = self.get_object()
        
        # Check permissions
        if str(car.seller_id) != str(request.user.id) and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image id from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'status': 'error', 'message': 'No image_id provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find and remove the image
        found = False
        was_primary = False
        new_images = []
        
        for img in car.images:
            if str(img._id) == image_id:
                found = True
                was_primary = img.is_primary
                # Delete the file
                try:
                    import os
                    file_path = os.path.join(settings.MEDIA_ROOT, img.image_path)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception:
                    pass  # Continue even if file deletion fails
            else:
                new_images.append(img)
        
        if not found:
            return Response({'status': 'error', 'message': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Set a new primary image if the deleted one was primary
        if was_primary and new_images:
            new_images[0].is_primary = True
        
        car.images = new_images
        car.save()
        
        serializer = self.get_serializer(car)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_primary_image(self, request, pk=None):
        """Set an image as the primary image for a car"""
        car = self.get_object()
        
        # Check permissions
        if str(car.seller_id) != str(request.user.id) and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image id from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'status': 'error', 'message': 'No image_id provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the image and set it as primary
        found = False
        for img in car.images:
            if str(img._id) == image_id:
                img.is_primary = True
                found = True
            else:
                img.is_primary = False
        
        if not found:
            return Response({'status': 'error', 'message': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        car.save()
        serializer = self.get_serializer(car)
        return Response(serializer.data)