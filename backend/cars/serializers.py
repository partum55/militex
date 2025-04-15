from rest_framework import serializers
from .models import Car, CarImage


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

    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model', 'year', 'mileage', 'vehicle_type',
            'condition', 'fuel_type', 'transmission', 'body_type',
            'country', 'city', 'price', 'negotiable',
            'engine_size', 'engine_power', 'description',
            'created_at', 'updated_at', 'seller', 'seller_username',
            'seller_phone', 'images', 'uploaded_images',
            'original_url', 'is_imported'
        ]
        read_only_fields = ['seller', 'created_at', 'updated_at']

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        car = Car.objects.create(**validated_data)

        for image in uploaded_images:
            CarImage.objects.create(car=car, image=image)

        return car
