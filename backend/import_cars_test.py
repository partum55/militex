"""
Quick test script to import cars from auto.ria.com
Run with:
python manage.py shell < import_cars_test.py
"""

import os
import sys
import django

print("Starting car import test...")

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()

from django.contrib.auth import get_user_model
from cars.models import Car, CarImage
from cars.parser_integration import import_cars_sync

User = get_user_model()

# Get or create admin user
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'is_staff': True,
        'is_superuser': True
    }
)

if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print("Created admin user")

# Import cars
try:
    print("Starting import...")
    count = import_cars_sync(10, admin_user_id=admin_user.id)
    print(f"Successfully imported {count} cars")
except Exception as e:
    print(f"Error during import: {e}")
    import traceback
    traceback.print_exc()

# Print summary
cars_count = Car.objects.count()
images_count = CarImage.objects.count()
print(f"Total cars in database: {cars_count}")
print(f"Total car images in database: {images_count}")
