from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SellerRating

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone_number', 'is_military', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SellerRatingSerializer(serializers.ModelSerializer):
    rater_username = serializers.ReadOnlyField(source='rater.username')

    class Meta:
        model = SellerRating
        fields = ['id', 'seller', 'rater', 'rater_username', 'rating', 'comment', 'created_at']
        read_only_fields = ['rater', 'created_at']
