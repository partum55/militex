from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .models import SellerRating
from .serializers import UserSerializer, SellerRatingSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            # Allow anyone to register
            permission_classes = [AllowAny]
        elif self.action == 'me':
            # Only authenticated users can access their own data
            permission_classes = [IsAuthenticated]
        elif self.request.user.is_staff:
            # Staff can do anything
            permission_classes = [IsAuthenticated]
        else:
            # Default to authenticated only
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class SellerRatingViewSet(viewsets.ModelViewSet):
    queryset = SellerRating.objects.all()
    serializer_class = SellerRatingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(rater=self.request.user)

    def get_queryset(self):
        queryset = SellerRating.objects.all()
        seller_id = self.request.query_params.get('seller', None)
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        return queryset
