from rest_framework import serializers
from cars.models import Car, CarImage
import os
from django.conf import settings


class CarImageSerializer(serializers.ModelSerializer):
    """Serializer for car images"""
    image = serializers.SerializerMethodField()

    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def get_image(self, obj):
        """Generate full URL for image"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class CarSerializer(serializers.ModelSerializer):
    """Serializer for cars"""
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
            'country', 'negotiable', 'engine_size', 'engine_power', 'updated_at'
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']

    def get_seller(self, obj):
        return {
            'id': obj.seller.id,
            'username': obj.seller.username
        }

    def create(self, validated_data):
        """Create a new car with uploaded images"""
        # Pop image files to handle separately
        image_files = validated_data.pop('image_files', [])

        # Create the car instance
        car = Car.objects.create(**validated_data)

        # Process and save each uploaded image
        for i, image_file in enumerate(image_files):
            CarImage.objects.create(
                car=car,
                image=image_file,
                is_primary=(i == 0)  # First image is primary
            )

        return car

    def update(self, instance, validated_data):
        """Update car and handle image updates"""
        # Pop image files to handle separately
        image_files = validated_data.pop('image_files', [])

        # Update the car instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Add new images if provided
        if image_files:
            # Check if there are existing images
            has_existing_images = instance.images.exists()

            for i, image_file in enumerate(image_files):
                CarImage.objects.create(
                    car=instance,
                    image=image_file,
                    # Make the first uploaded image primary if no existing images
                    is_primary=(not has_existing_images and i == 0)
                )

        return instance
