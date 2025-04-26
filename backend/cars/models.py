from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Car(models.Model):
    CONDITION_CHOICES = (
        ('new', _('New')),
        ('used', _('Used')),
        ('damaged', _('Damaged')),
    )

    FUEL_CHOICES = (
        ('gasoline', _('Gasoline')),
        ('diesel', _('Diesel')),
        ('gas', _('Gas')),
        ('electric', _('Electric')),
        ('hybrid', _('Hybrid')),
    )

    BODY_TYPE_CHOICES = (
        ('sedan', _('Sedan')),
        ('estate', _('Estate')),
        ('suv', _('SUV')),
        ('pickup', _('Pickup')),
        ('hatchback', _('Hatchback')),
        ('liftback', _('Liftback')),
        ('coupe', _('Coupe')),
        ('fastback', _('Fastback')),
        ('hardtop', _('Hardtop')),
    )

    TRANSMISSION_CHOICES = (
        ('manual', _('Manual')),
        ('automatic', _('Automatic')),
        ('semi-automatic', _('Semi-Automatic')),
    )

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cars')
    make = models.CharField(_('Make'), max_length=100)
    model = models.CharField(_('Model'), max_length=100)
    year = models.PositiveIntegerField(_('Year of Manufacture'))
    mileage = models.PositiveIntegerField(_('Mileage'))
    vehicle_type = models.CharField(_('Vehicle Type'), max_length=100)
    condition = models.CharField(_('Condition'), max_length=20, choices=CONDITION_CHOICES)
    fuel_type = models.CharField(_('Fuel Type'), max_length=20, choices=FUEL_CHOICES)
    transmission = models.CharField(_('Transmission'), max_length=20, choices=TRANSMISSION_CHOICES)
    body_type = models.CharField(_('Body Type'), max_length=20, choices=BODY_TYPE_CHOICES, blank=True, null=True)

    # Location
    country = models.CharField(_('Country'), max_length=100)
    city = models.CharField(_('City/Region'), max_length=100)

    # Price details
    price = models.DecimalField(_('Price'), max_digits=10, decimal_places=2)
    negotiable = models.BooleanField(_('Negotiable Price'), default=False)

    # Engine details
    engine_size = models.FloatField(_('Engine Size'), blank=True, null=True)
    engine_power = models.PositiveIntegerField(_('Engine Power (HP)'), blank=True, null=True)

    # Description and photos
    description = models.TextField(_('Description'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Original listing data
    original_url = models.URLField(_('Original URL'), blank=True, null=True)
    is_imported = models.BooleanField(_('Is Imported'), default=False)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Car')
        verbose_name_plural = _('Cars')


class CarImage(models.Model):
    car = models.ForeignKey(Car, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='car_images/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.car} ({self.id})"
