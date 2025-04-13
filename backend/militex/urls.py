from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.views.generic import RedirectView

from accounts.views import UserViewSet, SellerRatingViewSet
from cars.views import CarViewSet
from fundraiser.views import FundraiserViewSet, DonationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'ratings', SellerRatingViewSet)
router.register(r'cars', CarViewSet)
router.register(r'fundraisers', FundraiserViewSet)
router.register(r'donations', DonationViewSet)

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=True)),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/accounts/', include('accounts.urls')),
    path('api/cars/', include('cars.urls')),
    path('api/fundraiser/', include('fundraiser.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
