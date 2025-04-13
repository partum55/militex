from django.urls import path
from .views import CarListCreateView

urlpatterns = [
    path("", CarListCreateView.as_view(), name="car-list-create"),
]
