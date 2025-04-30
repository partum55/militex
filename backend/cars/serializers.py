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


class CarSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    images = CarImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    seller = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year', 'price', 'mileage', 'description', 
                  'seller', 'created_at', 'images', 'image_files', 'fuel_type', 
                  'transmission', 'body_type', 'condition', 'city', 'vehicle_type', 
                  'country', 'negotiable', 'engine_size', 'engine_power']
        read_only_fields = ['id', 'seller', 'created_at']

    def get_id(self, obj):
        return str(obj._id)
    
    def get_seller(self, obj):
        return {
            'id': obj.seller_id,
            'username': obj.seller_username
        }

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        car = Car.objects.create(**validated_data)

        # Process images for MongoDB
        images = []
        for i, image_file in enumerate(image_files):
            # Generate image filename and path
            filename = f"{str(ObjectId())}_{image_file.name}"
            image_path = f"car_images/{filename}"
            
            # Save the file to media directory
            save_path = os.path.join(settings.MEDIA_ROOT, 'car_images')
            os.makedirs(save_path, exist_ok=True)
            
            full_path = os.path.join(save_path, filename)
            with open(full_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)
            
            # Add image to car's image array
            from datetime import datetime
            images.append({
                '_id': ObjectId(),
                'image_path': image_path,
                'is_primary': i == 0,  # First image is primary
                'uploaded_at': datetime.now(),
            })
        
        # Update the car with images
        if images:
            car.images = images
            car.save()

        return car