from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
import json

from cars.models import Car, CarImage
from cars.serializers import CarSerializer
from cars.filters import CarFilter  # You'll need to update this too
from cars.parser_integration import import_cars_sync

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller_id == request.user.id

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class CarViewSet(viewsets.ModelViewSet):
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # For MongoEngine, we use .objects() instead of .objects.all()
        return Car.objects()
    
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
        queryset = Car.objects(seller_id=request.user.id)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # ... rest of your methods updated similarly