import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import csrf, run_import

# ---------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------
urlpatterns = [
    path('admin/', admin.site.urls),
    path('csrf/', csrf),
    path('run-import/', run_import),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('accounts.urls')),
    path('api/cars/', include('cars.urls')),
    path('api/fundraisers/', include('fundraiser.urls')),
    path('media/browse/<path:path>', serve, {
            'document_root': settings.MEDIA_ROOT,
            'show_indexes': True
    }),
    
    # Regular media serving
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]

# ---------------------------------------------------------------------
# Serve static files (CSS, JS, etc.) via WhiteNoise in both DEBUG & PROD
# ---------------------------------------------------------------------
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# ---------------------------------------------------------------------
# Serve media files in development
# ---------------------------------------------------------------------
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# else:
#     # For production, add a simple pass-through to help with debugging
#     # This won't actually serve files in production, your web server should do that
#     urlpatterns += [
#         path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT})
#     ]
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT})
]
# ---------------------------------------------------------------------
# Catch-all: serve React's index.html for any other path
# ---------------------------------------------------------------------
urlpatterns += [
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='index.html')),
]