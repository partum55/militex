# scripts/import_parsed_data.py
import os
import django
import traceback
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()

from cars.models import Car, CarImage
from cars.parser_integration import import_cars_sync
from django.contrib.auth import get_user_model

def run():
    try:
        print("Starting car data import process...")
        
        # Delete existing cars if needed
        Car.objects().delete()
        print("Deleted existing cars")
        
        # Create admin user if needed
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

        # Run the import process
        print("Importing from Auto.ria...")
        count = import_cars_sync(10, admin_user_id=admin_user.id)
        print(f"Imported {count} cars from Auto.ria")
        
        # Verify import
        total_count = Car.objects().count()
        print(f"Total cars in database: {total_count}")
        
        print("Data import completed!")
        print("✔ CRON Import script executed successfully at:", datetime.datetime.now())
            
    except Exception as e:
        print(f"Error during import: {e}")
        traceback.print_exc()