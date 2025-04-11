from rest_framework import generics
from .models import Car
from .serializers import CarSerializer

class CarListCreateView(generics.ListCreateAPIView):
    queryset = Car.objects.all().order_by('-created_at')
    serializer_class = CarSerializer
