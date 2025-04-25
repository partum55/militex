from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
import json

from .models import Car, CarImage
from .serializers import CarSerializer
from .filters import CarFilter
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
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Enhanced create method to handle file uploads better"""
        # Print out debug info
        debug_info = {
            'Content-Type': request.content_type,
            'POST keys': list(request.POST.keys()),
            'FILES keys': list(request.FILES.keys()),
        }
        print("Create request debug info:", debug_info)

        # Process the create normally
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Enhanced update method to handle file uploads better"""
        # Print out debug info
        debug_info = {
            'Content-Type': request.content_type,
            'PUT/PATCH keys': list(request.data.keys() if hasattr(request.data, 'keys') else []),
            'FILES keys': list(request.FILES.keys()),
        }
        print("Update request debug info:", debug_info)

        # Process the update normally
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get the current user's car listings"""
        queryset = self.queryset.filter(seller=request.user)
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
            count = import_cars_sync(limit=limit, admin_user_id=request.user.id)
            return Response({'status': 'success', 'imported': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_images(self, request, pk=None):
        """Add images to an existing car"""
        car = self.get_object()

        # Check permissions
        if car.seller != request.user and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to add images to this car'},
                            status=status.HTTP_403_FORBIDDEN)

        # Get images from request
        images = request.FILES.getlist('images')
        if not images:
            return Response({'detail': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Add images to car
        for image_file in images:
            CarImage.objects.create(car=car, image=image_file)

        # Return updated car
        serializer = self.get_serializer(car)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def delete_image(self, request, pk=None):
        """Delete an image from a car"""
        car = self.get_object()

        # Check permissions
        if car.seller != request.user and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to delete images from this car'},
                            status=status.HTTP_403_FORBIDDEN)

        # Get image ID from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'detail': 'No image ID provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete image
        try:
            image = CarImage.objects.get(id=image_id, car=car)
            image.delete()

            # If this was the primary image, set a new primary image if possible
            if image.is_primary and car.images.exists():
                new_primary = car.images.first()
                new_primary.is_primary = True
                new_primary.save()

            return Response({'status': 'success'})
        except CarImage.DoesNotExist:
            return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def set_primary_image(self, request, pk=None):
        """Set an image as the primary image for a car"""
        car = self.get_object()

        # Check permissions
        if car.seller != request.user and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to modify this car'},
                            status=status.HTTP_403_FORBIDDEN)

        # Get image ID from request
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'detail': 'No image ID provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Set as primary
        try:
            # First, unset all primary images
            car.images.update(is_primary=False)

            # Then set the new primary
            image = CarImage.objects.get(id=image_id, car=car)
            image.is_primary = True
            image.save()

            return Response({'status': 'success'})
        except CarImage.DoesNotExist:
            return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)