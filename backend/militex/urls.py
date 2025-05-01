import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import csrf, run_import

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
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

urlpatterns += [
    re_path(r'^(?!media).*$', TemplateView.as_view(template_name='index.html')),
]