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


def get_fuel_type_mapping(source_type):
    """Map fuel types from parser to Django model choices"""
    mapping = {
        'Бензин': 'gasoline',
        'Дизель': 'diesel',
        'Электро': 'electric',
        'Гибрид': 'hybrid',
        'Газ': 'gas',
        'Невідомо': 'gasoline',  # Default to gasoline
    }
    return mapping.get(source_type, 'gasoline')


def get_body_type_mapping(source_type):
    """Map body types from parser to Django model choices"""
    mapping = {
        'Позашляховик / Кросовер': 'suv',
        'Седан': 'sedan',
        'Хетчбек': 'hatchback',
        'Универсал': 'estate',
        'Купе': 'coupe',
        'Пикап': 'pickup',
        'Невідомо': 'suv',  # Default to SUV
    }
    return mapping.get(source_type, 'suv')


def get_transmission_mapping(source_type):
    """Map transmission types from parser to Django model choices"""
    mapping = {
        'Автомат': 'automatic',
        'Механика': 'manual',
        'Типтроник': 'semi-automatic',
        'Невідомо': 'automatic',  # Default to automatic
    }
    return mapping.get(source_type, 'automatic')


def get_condition_mapping(source_condition):
    """Map condition from parser to Django model choices"""
    if 'Гарний' in source_condition or 'Відмінний' in source_condition:
        return 'new'
    elif 'Потребує ремонту' in source_condition or 'Після ДТП' in source_condition:
        return 'damaged'
    else:
        return 'used'  # Default to used


def import_cars_data():
    # Connect to SQLite database created by the parser
    conn = sqlite3.connect('test_parcing_data.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all cars from the parser database
    cursor.execute("SELECT * FROM cars")
    cars_data = cursor.fetchall()

    # Get or create a default admin user to be the seller
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'is_staff': True,
            'is_superuser': True
        }
    )

    if created:
        admin_user.set_password('admin123')  # Set a default password
        admin_user.save()
        print("Created admin user")

    # Import each car to Django models
    counter = 0
    with transaction.atomic():
        for car_data in cars_data:
            # Extract data from parser record
            name_parts = car_data['name'].split()

            # Try to extract make and model
            if len(name_parts) >= 2:
                make = name_parts[0]
                model = ' '.join(name_parts[1:])
            else:
                make = car_data['name']
                model = 'Unknown'

            # Get or create car in Django database
            car, created = Car.objects.get_or_create(
                make=make,
                model=model,
                defaults={
                    'year': int(car_data.get('year', 2020)),
                    'mileage': int(car_data.get('mileage', 0)),
                    'vehicle_type': 'suv',  # Default SUV since most are SUVs
                    'condition': get_condition_mapping(car_data.get('condition', '')),
                    'fuel_type': get_fuel_type_mapping(car_data.get('fuel_type', '')),
                    'transmission': get_transmission_mapping(car_data.get('transmission', '')),
                    'body_type': get_body_type_mapping(car_data.get('body_type', '')),
                    'country': 'Ukraine',  # Default country
                    'city': 'Kyiv',  # Default city
                    'price': float(car_data.get('price', 0)),
                    'negotiable': True,  # Default to negotiable
                    'description': car_data.get('description', ''),
                    'seller': admin_user,
                }
            )

            if created:
                counter += 1
                print(f"Imported: {car.make} {car.model} ({car.year})")

    print(f"Import completed. {counter} cars imported.")
    conn.close()


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
    count = import_cars_sync(limit=10, admin_user_id=admin_user.id)
    print(f"Imported {count} cars from Auto.ria")

    # 2. Імпорт з SQLite-файлу
    import_cars_data()

    print("Data import completed!")