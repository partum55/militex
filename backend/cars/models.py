from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid
import os

User = get_user_model()


def car_image_upload_path(instance, filename):
    """Generate upload path for car images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('cars', str(instance.car.id), filename)


class Car(models.Model):
    """Car listing model"""
    STATUS_CHOICES = (
        ('active', _('Active')),
        ('sold', _('Sold')),
        ('pending', _('Pending')),
        ('draft', _('Draft')),
    )

    BODY_TYPE_CHOICES = (
        ('sedan', _('Sedan')),
        ('suv', _('SUV')),
        ('truck', _('Truck')),
        ('hatchback', _('Hatchback')),
        ('convertible', _('Convertible')),
        ('coupe', _('Coupe')),
        ('van', _('Van')),
        ('wagon', _('Wagon')),
        ('other', _('Other')),
    )

    TRANSMISSION_CHOICES = (
        ('automatic', _('Automatic')),
        ('manual', _('Manual')),
        ('semi-auto', _('Semi-Automatic')),
    )

    FUEL_TYPE_CHOICES = (
        ('petrol', _('Petrol')),
        ('diesel', _('Diesel')),
        ('electric', _('Electric')),
        ('hybrid', _('Hybrid')),
        ('other', _('Other')),
    )

    # Basic information
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars')
    make = models.CharField(max_length=100, db_index=True)
    model = models.CharField(max_length=100, db_index=True)
    year = models.PositiveIntegerField(db_index=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, db_index=True)
    currency = models.CharField(max_length=3, default='USD')
    mileage = models.PositiveIntegerField()
    mileage_unit = models.CharField(max_length=10, default='km')

    # Details
    description = models.TextField(blank=True)
    body_type = models.CharField(max_length=20, choices=BODY_TYPE_CHOICES, db_index=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, db_index=True)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, db_index=True)
    color = models.CharField(max_length=50)
    vin = models.CharField(max_length=100, blank=True, null=True, unique=True)

    # Location
    location_city = models.CharField(max_length=100)
    location_state = models.CharField(max_length=100)
    location_country = models.CharField(max_length=100)
    location_latitude = models.FloatField(null=True, blank=True)
    location_longitude = models.FloatField(null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['make', 'model']),
            models.Index(fields=['status', 'owner']),
            models.Index(fields=['price', 'year']),
            models.Index(fields=['location_city', 'location_state']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

    @property
    def primary_image(self):
        """Return the primary image for this car"""
        primary = self.images.filter(is_primary=True).first()
        if primary:
            return primary
        return self.images.first()  # Fallback to first image if no primary set


class CarImage(models.Model):
    """Image model for car listing"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=car_image_upload_path)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'created_at']

    def __str__(self):
        return f"Image for {self.car} ({'Primary' if self.is_primary else 'Secondary'})"


class CarFeature(models.Model):
    """Features for car listings (replaces embedded document from MongoDB)"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=255)

    class Meta:
        unique_together = ['car', 'name']
        indexes = [
            models.Index(fields=['name', 'value']),
        ]

    def __str__(self):
        return f"{self.name}: {self.value}"


class CarContact(models.Model):
    """Contact information for car listings (replaces embedded document from MongoDB)"""
    car = models.OneToOneField(Car, on_delete=models.CASCADE, related_name='contact')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    preferred_contact_method = models.CharField(max_length=20, default='phone')

    def __str__(self):
        return f"Contact for {self.car}"
