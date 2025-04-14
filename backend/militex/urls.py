from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import index, csrf

router = DefaultRouter()
# Uncomment and register your viewsets if needed:
# router.register(r'users', UserViewSet)
# router.register(r'ratings', SellerRatingViewSet)
# router.register(r'cars', CarViewSet)
# router.register(r'fundraisers', FundraiserViewSet)
# router.register(r'donations', DonationViewSet)

urlpatterns = [
    path('', index, name='index'),
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('csrf/', csrf),
    path('api/cars/', include('cars.urls')),
    path('api/fundraiser/', include('fundraiser.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # This should catch any URL not matched above
    re_path(r'^.*$', index, name='index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
