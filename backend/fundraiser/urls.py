from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FundraiserViewSet, DonationViewSet

router = DefaultRouter()
router.register(r'', FundraiserViewSet)
router.register(r'donations', DonationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
