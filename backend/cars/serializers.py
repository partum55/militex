from rest_framework import serializers
from .models import Car, CarImage


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary']
        read_only_fields = ['id']


class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year', 'price', 'mileage', 'description', 'seller', 'created_at', 'images', 'image_files']
        read_only_fields = ['id', 'seller', 'created_at']

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        car = Car.objects.create(**validated_data)

        # Process and save images
        for image_file in image_files:
            CarImage.objects.create(car=car, image=image_file, is_primary=(image_files.index(image_file) == 0))

        return car