from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import csrf

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('csrf/', csrf),
    path('api/cars/', include('cars.urls')),
    path('api/fundraiser/', include('fundraiser.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Catch all routes and serve React's index.html
    re_path(r'^(?!api/)(?!admin/)(?!static/)(?!media/)(?!csrf/).*$',
            TemplateView.as_view(template_name='index.html'), name='index'),
]

# For development only - serve static and media files
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
