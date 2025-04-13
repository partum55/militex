from django.urls import path
from .views import RegisterView, login_view, get_user_profile

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('profile/', get_user_profile, name='profile'),
]