# scripts/import_parsed_data.py

import os
import django
import traceback
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()  # Це обов'язково ДО імпортів моделей
from cars.models import Car, CarImage
from cars.parser_integration import import_cars_sync

from django.contrib.auth import get_user_model

def run():
    try:
        print("Starting car data import process...")
        
        # Check if we already have cars
        existing_count = Car.objects.count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} cars. Skipping deletion.")
        else:
            print("Database is empty. Preparing for initial import.")
            # Only delete if empty (which it already is)
            CarImage.objects.all().delete()
            Car.objects.all().delete()
            print("Ensuring database is clean for import.")

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
        else:
            print("Using existing admin user for import")

        print("Importing from Auto.ria...")
        count = import_cars_sync(100, admin_user_id=admin_user.id)
        print(f"Imported {count} cars from Auto.ria")
        
        total_count = Car.objects.count()
        print(f"Total cars in database: {total_count}")
        total_images = CarImage.objects.count()
        print(f"Total car images in database: {total_images}")
        
        print("Data import completed!")
        
        # Mark as complete in the flag file
        with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.car_import_done'), 'w') as f:
            f.write(datetime.date.today().isoformat())
            
    except Exception as e:
        print(f"Error during import: {e}")
        traceback.print_exc()
