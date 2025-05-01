from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.conf import settings
import os

# Import DjangoFilterBackend from the correct package
from django_filters.rest_framework import DjangoFilterBackend

from .models import Car, CarImage
from .serializers import CarSerializer
from .parser_integration import import_cars_sync

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class CarViewSet(viewsets.ModelViewSet):
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['make', 'model', 'year', 'fuel_type', 'transmission', 
                       'body_type', 'condition', 'country', 'city', 'vehicle_type']
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Car.objects.all().prefetch_related('images')
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
                
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Filter by year range
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')
        
        if min_year:
            try:
                queryset = queryset.filter(year__gte=int(min_year))
            except ValueError:
                pass
                
        if max_year:
            try:
                queryset = queryset.filter(year__lte=int(max_year))
            except ValueError:
                pass
        
        # Filter by mileage range
        min_mileage = self.request.query_params.get('min_mileage')
        max_mileage = self.request.query_params.get('max_mileage')
        
        if min_mileage:
            try:
                queryset = queryset.filter(mileage__gte=int(min_mileage))
            except ValueError:
                pass
                
        if max_mileage:
            try:
                queryset = queryset.filter(mileage__lte=int(max_mileage))
            except ValueError:
                pass
        
        return queryset
    
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
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get the current user's car listings"""
        queryset = Car.objects.filter(seller=request.user).prefetch_related('images')
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
        if car.seller != request.user and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Process uploaded images
        images = request.FILES.getlist('images')
        if not images:
            return Response({'status': 'error', 'message': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add images to car
        for i, image_file in enumerate(images):
            try:
                CarImage.objects.create(
                    car=car,
                    image=image_file,
                    is_primary=not car.images.exists() and i == 0  # Primary only if first image and no existing images
                )
            except Exception as e:
                return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(car)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """Delete an image from a car"""
        car = self.get_object()
        
        # Check permissions
        if car.seller != request.user and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image id from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'status': 'error', 'message': 'No image_id provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find and remove the image
        try:
            image = CarImage.objects.get(id=image_id, car=car)
            was_primary = image.is_primary
            
            # Delete the image file
            if image.image and os.path.exists(image.image.path):
                os.remove(image.image.path)
                
            image.delete()
            
            # If the deleted image was primary, set a new primary image
            if was_primary:
                first_image = car.images.first()
                if first_image:
                    first_image.is_primary = True
                    first_image.save()
            
            serializer = self.get_serializer(car)
            return Response(serializer.data)
            
        except CarImage.DoesNotExist:
            return Response({'status': 'error', 'message': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def set_primary_image(self, request, pk=None):
        """Set an image as the primary image for a car"""
        car = self.get_object()
        
        # Check permissions
        if car.seller != request.user and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get image id from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'status': 'error', 'message': 'No image_id provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the image and set it as primary
        try:
            # First, set all images as non-primary
            car.images.update(is_primary=False)
            
            # Then set the requested image as primary
            image = CarImage.objects.get(id=image_id, car=car)
            image.is_primary = True
            image.save()
            
            serializer = self.get_serializer(car)
            return Response(serializer.data)
            
        except CarImage.DoesNotExist:
            return Response({'status': 'error', 'message': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)