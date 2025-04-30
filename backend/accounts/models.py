from django.utils.translation import gettext_lazy as _
import mongoengine as me
from datetime import datetime

# Car image embedded document
class CarImage(me.EmbeddedDocument):
    image_path = me.StringField(required=True)
    is_primary = me.BooleanField(default=False)
    uploaded_at = me.DateTimeField(default=datetime.now)

# Car document in MongoDB
class Car(me.Document):
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

    # Seller info
    seller_id = me.IntField(required=True)  # Reference to Django User.id
    seller_username = me.StringField(max_length=150)
    
    # Car details
    make = me.StringField(max_length=100, required=True)
    model = me.StringField(max_length=100, required=True)
    year = me.IntField(required=True)
    mileage = me.IntField(required=True)
    vehicle_type = me.StringField(max_length=100)
    condition = me.StringField(max_length=20, choices=[c[0] for c in CONDITION_CHOICES])
    fuel_type = me.StringField(max_length=20, choices=[c[0] for c in FUEL_CHOICES])
    transmission = me.StringField(max_length=20, choices=[c[0] for c in TRANSMISSION_CHOICES])
    body_type = me.StringField(max_length=20, choices=[c[0] for c in BODY_TYPE_CHOICES])

    # Location
    country = me.StringField(max_length=100)
    city = me.StringField(max_length=100)

    # Price details
    price = me.DecimalField(precision=2)
    negotiable = me.BooleanField(default=False)

    # Engine details
    engine_size = me.FloatField()
    engine_power = me.IntField()

    # Description and photos
    description = me.StringField()
    created_at = me.DateTimeField(default=datetime.now)
    updated_at = me.DateTimeField(default=datetime.now)

    # Original listing data
    original_url = me.StringField()
    is_imported = me.BooleanField(default=False)
    
    # Images (embedded documents)
    images = me.EmbeddedDocumentListField(CarImage)
    
    # Use cars_db database
    meta = {
        'db_alias': 'cars_db',
        'ordering': ['-created_at']
    }
    
    def __str__(self):
        return f"{self.year} {self.make} {self.model}"