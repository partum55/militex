"""
Emergency script to import cars from auto.ria
Run directly on the server with:
python manage.py shell < import_cars_script.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()

from django.contrib.auth import get_user_model
from cars.models import Car, CarImage
from cars.parser_integration import import_cars_sync

User = get_user_model()

def run_import():
    print("Starting emergency car import...")
    
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
        print("Created admin user for parser")
    
    # Import cars
    count = import_cars_sync(50, admin_user_id=admin_user.id)
    print(f"Successfully imported {count} cars from Auto.ria")

if __name__ == "__main__":
    run_import()
