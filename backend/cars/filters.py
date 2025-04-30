# backend/cars/filters.py
import django_filters
from bson.objectid import ObjectId


class MongoDBFilterBackend(django_filters.rest_framework.DjangoFilterBackend):
    """Custom filter backend for MongoDB"""
    def filter_queryset(self, request, queryset, view):
        # Extract filter parameters from request
        filter_params = {}
        
        # Process price range filters
        if 'min_price' in request.query_params:
            try:
                min_price = float(request.query_params.get('min_price'))
                filter_params['price__gte'] = min_price
            except (ValueError, TypeError):
                pass
                
        if 'max_price' in request.query_params:
            try:
                max_price = float(request.query_params.get('max_price'))
                filter_params['price__lte'] = max_price
            except (ValueError, TypeError):
                pass
        
        # Process year range filters
        if 'min_year' in request.query_params:
            try:
                min_year = int(request.query_params.get('min_year'))
                filter_params['year__gte'] = min_year
            except (ValueError, TypeError):
                pass
                
        if 'max_year' in request.query_params:
            try:
                max_year = int(request.query_params.get('max_year'))
                filter_params['year__lte'] = max_year
            except (ValueError, TypeError):
                pass
        
        # Process mileage range filters
        if 'min_mileage' in request.query_params:
            try:
                min_mileage = int(request.query_params.get('min_mileage'))
                filter_params['mileage__gte'] = min_mileage
            except (ValueError, TypeError):
                pass
                
        if 'max_mileage' in request.query_params:
            try:
                max_mileage = int(request.query_params.get('max_mileage'))
                filter_params['mileage__lte'] = max_mileage
            except (ValueError, TypeError):
                pass
        
        # Process exact match filters for car attributes
        for field in ['make', 'model', 'year', 'fuel_type', 'transmission', 
                     'body_type', 'condition', 'country', 'city', 'vehicle_type', 'seller_id']:
            if field in request.query_params:
                filter_params[field] = request.query_params.get(field)
        
        # Process contains filters (case-insensitive)
        if 'model__icontains' in request.query_params:
            filter_params['model__icontains'] = request.query_params.get('model__icontains')
            
        if 'city__icontains' in request.query_params:
            filter_params['city__icontains'] = request.query_params.get('city__icontains')
        
        # Convert any 'id' filter to '_id' for MongoDB
        if 'id' in request.query_params:
            try:
                id_value = request.query_params.get('id')
                obj_id = ObjectId(id_value)
                filter_params['id'] = obj_id
            except:
                pass
        
        # Apply filters to queryset
        if filter_params:
            queryset = queryset.filter(**filter_params)
            
        return queryset


# This is a placeholder class to maintain API compatibility
# The actual filtering is done in MongoDBFilterBackend
class CarFilter:
    class Meta:
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