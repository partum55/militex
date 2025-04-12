from django.urls import path
from .views import signup_view, login_view, CustomAuthToken
urlpatterns = [
    path('signup/', CustomAuthToken.as_view(), name='signup'),
    path('login/', CustomAuthToken.as_view(), name='login'),
]
