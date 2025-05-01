from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend

from cars.models import Car, CarImage
from cars.serializers import CarSerializer, CarImageSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners of an object to edit it"""

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the owner
        return obj.seller == request.user


class IsAdminUser(permissions.BasePermission):
    """Permission to only allow admin users"""

    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class CarViewSet(viewsets.ModelViewSet):
    """ViewSet for cars"""
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['make', 'model', 'year', 'fuel_type', 'transmission',
                        'body_type', 'condition', 'country', 'city', 'vehicle_type']
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get the queryset of cars with filtering"""
        queryset = Car.objects.all()

        # Handle price range filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Handle year range filters
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')
        if min_year:
            queryset = queryset.filter(year__gte=min_year)
        if max_year:
            queryset = queryset.filter(year__lte=max_year)

        # Handle mileage range filters
        min_mileage = self.request.query_params.get('min_mileage')
        max_mileage = self.request.query_params.get('max_mileage')
        if min_mileage:
            queryset = queryset.filter(mileage__gte=min_mileage)
        if max_mileage:
            queryset = queryset.filter(mileage__lte=max_mileage)

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
        """Add current user as seller when creating a car"""
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get the current user's car listings"""
        queryset = Car.objects.filter(seller=request.user)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
            # Check if there are existing images
            has_existing_images = car.images.exists()

            # Create the image
            CarImage.objects.create(
                car=car,
                image=image_file,
                is_primary=(not has_existing_images and i == 0)  # First image is primary if no existing images
            )

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
            image.delete()

            # If the deleted image was primary, set a new primary image
            if was_primary:
                remaining_images = car.images.all()
                if remaining_images.exists():
                    first_image = remaining_images.first()
                    first_image.is_primary = True
                    first_image.save()

            return Response({'status': 'success'})
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
            with transaction.atomic():
                # Reset all images to non-primary
                car.images.all().update(is_primary=False)

                # Set the selected image as primary
                image = CarImage.objects.get(id=image_id, car=car)
                image.is_primary = True
                image.save()

            return Response({'status': 'success'})
        except CarImage.DoesNotExist:
            return Response({'status': 'error', 'message': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
