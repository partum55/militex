#!/usr/bin/env python
"""
Script to import parsed car data from the SQLite database to Django models.
Save this file in your Django project root and run:
python import_parsed_data.py
"""
import os
import sys
import sqlite3
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'militex.settings')
django.setup()

# Import Django models
from cars.models import Car, CarImage
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

if __name__ == "__main__":
    print("Starting data import...")

    # 1. Парсимо і додаємо з Auto.ria (через твою існуючу логіку)
    from cars.parser_integration import import_cars_sync
    from django.contrib.auth import get_user_model

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
    count = import_cars_sync(100, admin_user_id=admin_user.id)
    print(f"Imported {count} cars from Auto.ria")

    print("Data import completed!")
