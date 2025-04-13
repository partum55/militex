from rest_framework import serializers
from .models import Fundraiser, Donation


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = ['id', 'fundraiser', 'donor', 'donor_name', 'amount',
                  'message', 'anonymous', 'created_at']
        read_only_fields = ['created_at']

    def get_donor_name(self, obj):
        if obj.anonymous:
            return "Anonymous"
        elif obj.donor:
            return obj.donor.username
        return "Guest"


class FundraiserSerializer(serializers.ModelSerializer):
    donations = DonationSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Fundraiser
        fields = ['id', 'title', 'description', 'target_amount',
                  'current_amount', 'image', 'created_by', 'created_by_username',
                  'is_active', 'created_at', 'updated_at',
                  'progress_percentage', 'donations']
        read_only_fields = ['created_by', 'current_amount',
                            'created_at', 'updated_at']
