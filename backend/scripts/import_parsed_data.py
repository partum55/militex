# scripts/import_parsed_data.py

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()  # Це обов’язково ДО імпортів моделей
from cars.models import Car, CarImage
from cars.parser_integration import import_cars_sync

from django.contrib.auth import get_user_model

def run():
    print("Deleting old car data...")
    CarImage.objects.all().delete()
    Car.objects.all().delete()
    print("Old data deleted.")

    User = get_user_model()
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

    print("Importing from Auto.ria...")
    count = import_cars_sync(300, admin_user_id=admin_user.id)
    print(f"Imported {count} cars from Auto.ria")
    print("Data import completed!")
