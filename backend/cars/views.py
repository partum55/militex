from django.db.models import Q, F, Count, Prefetch
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Car, CarImage, CarFeature
from .serializers import CarSerializer

User = get_user_model()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the car
        return obj.owner == request.user


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated and is an admin
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class CarViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows cars to be viewed or edited.
    """
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        'make',
        'model',
        'year',
        'body_type',
        'fuel_type',
        'transmission',
        'status'
    ]

    search_fields = [
        'make',
        'model',
        'description'
    ]

    ordering_fields = [
        'price',
        'year',
        'created_at'
    ]

    ordering = ['-created_at']

    def get_queryset(self):
        """
        Returns a filtered queryset of cars based on request parameters.
        Optimized for PostgreSQL with proper joins and filtering.
        """
        # Start with all cars, optimizing with select_related and prefetch_related
        queryset = Car.objects.all().select_related(
            'owner',
            'contact'
        ).prefetch_related(
            Prefetch('images', queryset=CarImage.objects.order_by('-is_primary', 'created_at')),
            'features'
        )

        # Filter by current user if requested
        user_filter = self.request.query_params.get('user', None)
        if user_filter and user_filter.lower() == 'me' and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)

        # Filter by owner username
        owner_username = self.request.query_params.get('owner_username', None)
        if owner_username:
            queryset = queryset.filter(owner__username=owner_username)

        # Price range filtering
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)

        if min_price:
            queryset = queryset.filter(price__gte=float(min_price))
        if max_price:
            queryset = queryset.filter(price__lte=float(max_price))

        # Year range filtering
        min_year = self.request.query_params.get('min_year', None)
        max_year = self.request.query_params.get('max_year', None)

        if min_year:
            queryset = queryset.filter(year__gte=int(min_year))
        if max_year:
            queryset = queryset.filter(year__lte=int(max_year))

        # Features filtering using JOIN with the features table
        features = self.request.query_params.getlist('features', [])
        if features:
            for feature in features:
                if ':' in feature:
                    name, value = feature.split(':', 1)
                    queryset = queryset.filter(features__name=name, features__value=value)
                else:
                    # Just filter by feature name if no value provided
                    queryset = queryset.filter(features__name=feature)

        # Mileage range filtering
        min_mileage = self.request.query_params.get('min_mileage', None)
        max_mileage = self.request.query_params.get('max_mileage', None)

        if min_mileage:
            queryset = queryset.filter(mileage__gte=int(min_mileage))
        if max_mileage:
            queryset = queryset.filter(mileage__lte=int(max_mileage))

        # Location filtering - PostgreSQL specific
        location_city = self.request.query_params.get('city', None)
        location_state = self.request.query_params.get('state', None)
        location_country = self.request.query_params.get('country', None)

        if location_city:
            # Case-insensitive search using PostgreSQL's ILIKE operator
            queryset = queryset.filter(location_city__iexact=location_city)
        if location_state:
            queryset = queryset.filter(location_state__iexact=location_state)
        if location_country:
            queryset = queryset.filter(location_country__iexact=location_country)

        # Radius search for location (PostgreSQL specific using PostGIS)
        radius = self.request.query_params.get('radius', None)
        lat = self.request.query_params.get('lat', None)
        lng = self.request.query_params.get('lng', None)

        if radius and lat and lng:
            # If PostGIS is installed, use ST_DWithin
            try:
                # Convert lat/lng to points
                point = f"POINT({lng} {lat})"
                queryset = queryset.filter(
                    location_latitude__isnull=False,
                    location_longitude__isnull=False
                ).extra(
                    where=[
                        """
                        ST_DWithin(
                            ST_SetSRID(ST_MakePoint(location_longitude, location_latitude), 4326)::geography,
                            ST_SetSRID(ST_GeomFromText(%s), 4326)::geography,
                            %s * 1000
                        )
                        """
                    ],
                    params=[point, radius]
                )
            except Exception:
                # Fallback to simpler filtering if PostGIS is not available
                # Simple bounding box approximation
                radius_degrees = float(radius) / 111.0  # Rough conversion from km to degrees
                lat_float = float(lat)
                lng_float = float(lng)
                queryset = queryset.filter(
                    location_latitude__range=(lat_float - radius_degrees, lat_float + radius_degrees),
                    location_longitude__range=(lng_float - radius_degrees, lng_float + radius_degrees)
                )

        # Text search - PostgreSQL specific
        query = self.request.query_params.get('query', None)
        if query:
            # Use PostgreSQL full-text search
            queryset = queryset.filter(
                Q(make__icontains=query) |
                Q(model__icontains=query) |
                Q(description__icontains=query)
            )

        return queryset.distinct()

    def get_permissions(self):
        """
        Returns the list of permissions that this view requires.
        """
        if self.action == 'retrieve' or self.action == 'list':
            # Anyone can view car listings
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only owners can update or delete their cars
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        elif self.action in ['add_images', 'delete_image', 'set_primary_image']:
            # Only car owners can manage car images
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        elif self.action == 'my_listings':
            # Only authenticated users can view their own listings
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Default to IsAuthenticated for other actions
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Sets the owner of the car to the current user when creating a new car.
        Also handles initial image uploads and features.
        """
        # Begin a PostgreSQL transaction
        from django.db import transaction

        with transaction.atomic():
            # Save the car with the owner set to current user
            car = serializer.save(owner=self.request.user)

            # Extract features from request data and create CarFeature objects
            features_data = self.request.data.get('features', {})
            for name, value in features_data.items():
                CarFeature.objects.create(
                    car=car,
                    name=name,
                    value=str(value)
                )

            # Handle initial images
            images = self.request.FILES.getlist('images', [])

            # Create image objects for the car
            for i, image in enumerate(images):
                CarImage.objects.create(
                    car=car,
                    image=image,
                    is_primary=(i == 0)  # Make the first image primary
                )

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """
        Returns the cars listed by the current user.
        """
        # Filter cars by current user with optimized queries
        queryset = Car.objects.filter(owner=request.user).select_related(
            'owner',
            'contact'
        ).prefetch_related(
            Prefetch('images', queryset=CarImage.objects.order_by('-is_primary', 'created_at')),
            'features'
        )

        # Filter by status if provided
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Apply ordering
        ordering = request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)

        # Paginate the results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_images(self, request, pk=None):
        """
        Add images to the car.
        Uses PostgreSQL transaction for atomicity.
        """
        from django.db import transaction

        car = self.get_object()
        images = request.FILES.getlist('images', [])

        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if we're exceeding the max image limit
        current_image_count = CarImage.objects.filter(car=car).count()
        max_images = getattr(settings, 'MAX_CAR_IMAGES', 10)

        if current_image_count + len(images) > max_images:
            return Response(
                {'error': f'Cannot add more than {max_images} images per car'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_images = []

        # Use transaction to ensure all images are created or none
        with transaction.atomic():
            # Upload and create image records
            for image in images:
                car_image = CarImage.objects.create(
                    car=car,
                    image=image,
                    is_primary=False  # New uploads are not primary by default
                )
                created_images.append(car_image)

            # If this is the first image, make it primary
            if current_image_count == 0 and created_images:
                created_images[0].is_primary = True
                created_images[0].save()

        return Response(
            {'message': f'{len(created_images)} images added successfully'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """
        Delete an image from the car.
        Uses PostgreSQL transaction for atomicity.
        """
        from django.db import transaction

        car = self.get_object()
        image_id = request.data.get('image_id')

        if not image_id:
            return Response({'error': 'No image ID provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Get the image with FOR UPDATE to lock the row
                image = CarImage.objects.select_for_update().get(id=image_id, car=car)

                was_primary = image.is_primary
                image.delete()

                # If the deleted image was primary, set the first remaining image as primary
                if was_primary:
                    remaining_images = CarImage.objects.filter(car=car)
                    if remaining_images.exists():
                        first_image = remaining_images.first()
                        first_image.is_primary = True
                        first_image.save()

        except CarImage.DoesNotExist:
            return Response(
                {'error': 'Image not found or does not belong to this car'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {'message': 'Image deleted successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def set_primary_image(self, request, pk=None):
        """
        Set an image as the primary image for the car.
        Uses PostgreSQL transaction for atomicity.
        """
        from django.db import transaction

        car = self.get_object()
        image_id = request.data.get('image_id')

        if not image_id:
            return Response({'error': 'No image ID provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Get the new primary image with FOR UPDATE to lock the row
                new_primary = CarImage.objects.select_for_update().get(id=image_id, car=car)

                # Update all images atomically
                CarImage.objects.filter(car=car).update(is_primary=False)

                # Set the new primary image
                new_primary.is_primary = True
                new_primary.save()

        except CarImage.DoesNotExist:
            return Response(
                {'error': 'Image not found or does not belong to this car'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {'message': 'Primary image updated successfully'},
            status=status.HTTP_200_OK
        )
