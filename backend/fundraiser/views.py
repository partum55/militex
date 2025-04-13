from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Fundraiser, Donation
from .serializers import FundraiserSerializer, DonationSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class FundraiserViewSet(viewsets.ModelViewSet):
    queryset = Fundraiser.objects.all()
    serializer_class = FundraiserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def donate(self, request, pk=None):
        fundraiser = self.get_object()

        if not fundraiser.is_active:
            return Response(
                {"detail": "This fundraiser is no longer active."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DonationSerializer(data=request.data)
        if serializer.is_valid():
            # Set the fundraiser and donor
            donor = None if serializer.validated_data.get('anonymous', False) else request.user
            donation = serializer.save(fundraiser=fundraiser, donor=donor)

            # Update the fundraiser's current amount
            fundraiser.current_amount += donation.amount
            fundraiser.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Donation.objects.all()
        fundraiser_id = self.request.query_params.get('fundraiser', None)
        if fundraiser_id:
            queryset = queryset.filter(fundraiser_id=fundraiser_id)
        return queryset
