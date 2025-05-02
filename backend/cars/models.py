from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class Car(models.Model):
    """Car model using standard Django ORM for PostgreSQL"""
    # Define choices as tuples for form display
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

    # Seller info - Foreign Key to Django User
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='cars'
    )
    
    # Car details
    make = models.CharField(max_length=100, verbose_name=_('Make'))
    model = models.CharField(max_length=100, verbose_name=_('Model'))
    year = models.PositiveIntegerField(verbose_name=_('Year of Manufacture'))
    mileage = models.PositiveIntegerField(verbose_name=_('Mileage'))
    vehicle_type = models.CharField(max_length=100, verbose_name=_('Vehicle Type'))
    condition = models.CharField(
        max_length=20, 
        choices=CONDITION_CHOICES,
        verbose_name=_('Condition')
    )
    fuel_type = models.CharField(
        max_length=20, 
        choices=FUEL_CHOICES,
        verbose_name=_('Fuel Type')
    )
    transmission = models.CharField(
        max_length=20, 
        choices=TRANSMISSION_CHOICES,
        verbose_name=_('Transmission')
    )
    body_type = models.CharField(
        max_length=20, 
        choices=BODY_TYPE_CHOICES,
        null=True, 
        blank=True,
        verbose_name=_('Body Type')
    )

    # Location
    country = models.CharField(max_length=100, verbose_name=_('Country'))
    city = models.CharField(max_length=100, verbose_name=_('City/Region'))

    # Price details
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name=_('Price')
    )
    negotiable = models.BooleanField(default=False, verbose_name=_('Negotiable Price'))

    # Engine details
    engine_size = models.FloatField(null=True, blank=True, verbose_name=_('Engine Size'))
    engine_power = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Engine Power (HP)'))

    # Description and timestamps
    description = models.TextField(blank=True, verbose_name=_('Description'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Original listing data
    original_url = models.URLField(null=True, blank=True, verbose_name=_('Original URL'))
    is_imported = models.BooleanField(default=False, verbose_name=_('Is Imported'))
    
    class Meta:
        verbose_name = _('Car')
        verbose_name_plural = _('Cars')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.year} {self.make} {self.model}"


class CarImage(models.Model):
    """CarImage model using standard Django ORM for PostgreSQL"""
    car = models.ForeignKey(
        Car, 
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='car_images/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.car.make} {self.car.model}"
    
    class Meta:
        ordering = ['-is_primary', '-uploaded_at']