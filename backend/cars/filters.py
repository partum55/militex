# backend/cars/filters.py
import django_filters
from .models import Car
from bson.objectid import ObjectId


class MongoDBFilterBackend(django_filters.rest_framework.DjangoFilterBackend):
    """Custom filter backend for MongoDB"""
    def filter_queryset(self, request, queryset, view):
        filterset = self.get_filterset(request, queryset, view)
        
        if filterset is None:
            return queryset
            
        if not filterset.is_valid() and self.raise_exception:
            raise django_filters.exceptions.FieldLookupError(
                filterset.errors
            )
            
        # Convert any 'id' filter to '_id' for MongoDB
        if 'id' in request.query_params:
            try:
                id_value = request.query_params.get('id')
                obj_id = ObjectId(id_value)
                queryset = queryset.filter(_id=obj_id)
            except:
                pass
                
        return filterset.qs


class CarFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_year = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    max_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')
    seller_id = django_filters.CharFilter(field_name='seller_id')

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