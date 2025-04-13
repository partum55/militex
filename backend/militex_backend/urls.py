from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static

# Render React's index.html
def index(request):
    return render(request, "index.html")

urlpatterns = [
    path("", index, name="index"),
    path("admin", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/cars/", include("car.urls")),
    re_path(r"^(?:.*)/?$", index, name="index"),  # Catch-all for React routes
]

# Serve static/media in development
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
