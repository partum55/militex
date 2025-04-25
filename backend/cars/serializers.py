from rest_framework import serializers
from .models import Car, CarImage
import json


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary']


class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    seller_username = serializers.ReadOnlyField(source='seller.username')
    seller_phone = serializers.ReadOnlyField(source='seller.phone_number')
    images_to_delete = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model', 'year', 'mileage', 'vehicle_type',
            'condition', 'fuel_type', 'transmission', 'body_type',
            'country', 'city', 'price', 'negotiable',
            'engine_size', 'engine_power', 'description',
            'created_at', 'updated_at', 'seller', 'seller_username',
            'seller_phone', 'images', 'uploaded_images', 'images_to_delete',
            'original_url', 'is_imported'
        ]
        read_only_fields = ['seller', 'created_at', 'updated_at']

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        images_to_delete = validated_data.pop('images_to_delete', None)

        # Create the car object
        car = Car.objects.create(**validated_data)

        # Process uploaded images
        for image in uploaded_images:
            CarImage.objects.create(car=car, image=image)

        # Set the first image as primary if no images are marked as primary
        if not car.images.filter(is_primary=True).exists() and car.images.exists():
            first_image = car.images.first()
            first_image.is_primary = True
            first_image.save()

        return car

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        images_to_delete = validated_data.pop('images_to_delete', None)

        # Update the car fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle images to delete
        if images_to_delete:
            try:
                # Convert JSON string to list of IDs
                if isinstance(images_to_delete, str):
                    try:
                        image_ids = json.loads(images_to_delete)
                        if isinstance(image_ids, list):
                            CarImage.objects.filter(id__in=image_ids, car=instance).delete()
                    except json.JSONDecodeError:
                        # If not valid JSON, try to interpret as a single ID
                        try:
                            image_id = int(images_to_delete)
                            CarImage.objects.filter(id=image_id, car=instance).delete()
                        except ValueError:
                            # Not a valid ID, just log and continue
                            print(f"Invalid image ID format: {images_to_delete}")
            except Exception as e:
                print(f"Error deleting images: {e}")

        # Process new uploaded images
        for image in uploaded_images:
            CarImage.objects.create(car=instance, image=image)

        # Ensure there's a primary image if images exist
        if not instance.images.filter(is_primary=True).exists() and instance.images.exists():
            first_image = instance.images.first()
            first_image.is_primary = True
            first_image.save()

        return instance