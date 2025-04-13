from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Car
from .serializers import CarSerializer
from .filters import CarFilter


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        queryset = self.queryset.filter(seller=request.user)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
