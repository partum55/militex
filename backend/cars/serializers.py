# backend/cars/serializers.py
from rest_framework import serializers
from .models import Car
from bson.objectid import ObjectId
import os
from django.conf import settings


class CarImageSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    is_primary = serializers.BooleanField()
    uploaded_at = serializers.DateTimeField()
    
    def get_id(self, obj):
        return str(obj.get('_id'))
    
    def get_image(self, obj):
        image_path = obj.get('image_path')
        if image_path:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f"{settings.MEDIA_URL}{image_path}")
        return None


from rest_framework import serializers
from cars.models import Car, CarImage
import os
from django.conf import settings
from bson.objectid import ObjectId

class CarImageSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    is_primary = serializers.BooleanField()
    
    def get_id(self, obj):
        # MongoEngine embedded documents don't have IDs, generate one for API
        return str(ObjectId())
    
    def get_image(self, obj):
        image_path = obj.image_path
        if image_path:
            request = self.context.get('request')
            if request:
                # Ensure path doesn't have leading slash duplication
                if image_path.startswith('/'):
                    image_path = image_path[1:]
                return request.build_absolute_uri(f"{settings.MEDIA_URL}{image_path}")
        return None
class CarSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    make = serializers.CharField(max_length=100)
    model = serializers.CharField(max_length=100)
    year = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mileage = serializers.IntegerField()
    description = serializers.CharField(allow_blank=True, required=False)
    seller = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()
    images = serializers.SerializerMethodField()
    image_files = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    fuel_type = serializers.CharField(max_length=20)
    transmission = serializers.CharField(max_length=20)
    body_type = serializers.CharField(max_length=20, required=False, allow_null=True)
    condition = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100)
    vehicle_type = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)
    negotiable = serializers.BooleanField(default=False)
    engine_size = serializers.FloatField(required=False, allow_null=True)
    engine_power = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year', 'price', 'mileage', 'description', 
                  'seller', 'created_at', 'images', 'image_files', 'fuel_type', 
                  'transmission', 'body_type', 'condition', 'city', 'vehicle_type', 
                  'country', 'negotiable', 'engine_size', 'engine_power']
        read_only_fields = ['id', 'seller', 'created_at']

    def get_id(self, obj):
        return str(obj.id)
    
    def get_seller(self, obj):
        return {
            'id': obj.seller_id,
            'username': obj.seller_username
        }
    
    def get_images(self, obj):
        serializer = CarImageSerializer(obj.images, many=True)
        return serializer.data
    
    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        
        # Get seller info from context
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['seller_id'] = request.user.id
            validated_data['seller_username'] = request.user.username
            
        # Create car document
        car = Car(**validated_data)
        
        # Process images
        images = []
        for i, image_file in enumerate(image_files):
            # Generate image filename and path
            from datetime import datetime
            import os
            
            filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{image_file.name}"
            image_path = f"car_images/{filename}"
            
            # Save the file to media directory
            from django.conf import settings
            import os
            
            save_path = os.path.join(settings.MEDIA_ROOT, 'car_images')
            os.makedirs(save_path, exist_ok=True)
            
            full_path = os.path.join(save_path, filename)
            with open(full_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)
            
            # Add image to car's image array
            image = CarImage(
                image_path=image_path,
                is_primary=(i == 0),  # First image is primary
            )
            images.append(image)
        
        # Add images to car
        car.images = images
        car.save()
        return car
    
    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            if key != 'image_files':
                setattr(instance, key, value)
        
        # Process new images if any
        image_files = validated_data.pop('image_files', [])
        if image_files:
            for i, image_file in enumerate(image_files):
                # Similar image processing as in create
                filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{image_file.name}"
                image_path = f"car_images/{filename}"
                
                save_path = os.path.join(settings.MEDIA_ROOT, 'car_images')
                os.makedirs(save_path, exist_ok=True)
                
                full_path = os.path.join(save_path, filename)
                with open(full_path, 'wb+') as destination:
                    for chunk in image_file.chunks():
                        destination.write(chunk)
                
                # Add image to car's image array
                image = CarImage(
                    image_path=image_path,
                    is_primary=(len(instance.images) == 0 and i == 0),  # Primary if first image and no existing images
                )
                instance.images.append(image)
        
        instance.save()
        return instance