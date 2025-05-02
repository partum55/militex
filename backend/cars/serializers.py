from rest_framework import serializers
from django.conf import settings
from .models import Car, CarImage
from django.utils import timezone

class CarImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    
    def get_image(self, obj):
        """Generate proper image URL that works with Django's static file handling"""
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    seller = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model', 'year', 'price', 'mileage', 'description', 
            'seller', 'created_at', 'images', 'image_files', 'fuel_type', 
            'transmission', 'body_type', 'condition', 'city', 'vehicle_type', 
            'country', 'negotiable', 'engine_size', 'engine_power'
        ]
        read_only_fields = ['id', 'seller', 'created_at']
    
    def get_seller(self, obj):
        return {
            'id': obj.seller.id,
            'username': obj.seller.username
        }
    
    def create(self, validated_data):
        """Handle creation of Car with multiple images"""
        image_files = validated_data.pop('image_files', [])
        
        # Create the car instance
        car = Car.objects.create(**validated_data)
        
        # Process and save images
        for i, image_file in enumerate(image_files):
            CarImage.objects.create(
                car=car,
                image=image_file,
                is_primary=(i == 0)  # First image is primary
            )
        
        return car
        
    def update(self, instance, validated_data):
        """Handle updating a Car with possible new images"""
        image_files = validated_data.pop('image_files', [])
        
        # Update car instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Process new images if any
        if image_files:
            # Check if this car has any images already
            has_images = instance.images.exists()
            
            for i, image_file in enumerate(image_files):
                CarImage.objects.create(
                    car=instance,
                    image=image_file,
                    is_primary=(not has_images and i == 0)  # Primary only if first image and no existing images
                )
                
        return instance