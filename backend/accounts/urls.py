from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SellerRatingViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'ratings', SellerRatingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
