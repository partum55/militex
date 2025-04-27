"""
Run this script to manually import cars without waiting for Django startup
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()

# Ensure placeholder image exists
try:
    from pathlib import Path
    from django.conf import settings
    
    print("Creating placeholder image directory and file...")
    static_dir = Path(settings.BASE_DIR) / 'static'
    static_dir.mkdir(exist_ok=True)
    images_dir = static_dir / 'images'
    images_dir.mkdir(exist_ok=True)
    placeholder_path = images_dir / 'car-placeholder.jpg'
    
    if not placeholder_path.exists():
        placeholder_path.touch()
        print(f"Created empty placeholder at {placeholder_path}")
    else:
        print(f"Placeholder already exists at {placeholder_path}")
except Exception as e:
    print(f"Error ensuring placeholder image: {e}")

# Import cars
from django.contrib.auth import get_user_model
from cars.models import Car, CarImage
from cars.parser_integration import import_cars_sync

print("Starting forced car import...")

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
    print("Created admin user for import")
else:
    print(f"Using existing admin user: {admin_user.username}")

# Force import even if we have cars already
print("Starting car import...")
try:
    count = import_cars_sync(50, admin_user_id=admin_user.id)
    print(f"Successfully imported {count} cars")
except Exception as e:
    print(f"Error during import: {e}")
    import traceback
    traceback.print_exc()

# Print summary
cars_count = Car.objects.count()
images_count = CarImage.objects.count()
print(f"Total cars in database now: {cars_count}")
print(f"Total car images in database now: {images_count}")

# Update import done flag
import datetime
flag_file = os.path.join(settings.BASE_DIR, '.car_import_done')
with open(flag_file, 'w') as f:
    f.write(datetime.date.today().isoformat())
print(f"Updated import flag file: {flag_file}")
