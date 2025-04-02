from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Simple view for the homepage
def index(request):
    return HttpResponse("Welcome to Militex API Homepage")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path('api/', include('accounts.urls')),  # "api/signup/" and "api/login/" will now work
]
