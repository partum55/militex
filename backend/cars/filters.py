import django_filters
from .models import Car


class CarFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_year = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    max_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')

    class Meta:
        model = Car
        fields = {
            'make': ['exact'],
            'model': ['exact', 'icontains'],
            'year': ['exact'],
            'fuel_type': ['exact'],
            'transmission': ['exact'],
            'body_type': ['exact'],
            'condition': ['exact'],
            'country': ['exact'],
            'city': ['exact', 'icontains'],
            'vehicle_type': ['exact'],
        }
