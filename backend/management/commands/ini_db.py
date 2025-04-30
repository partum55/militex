# backend/militex/management/commands/init_db.py

import os
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connections


class Command(BaseCommand):
    help = 'Initialize both databases and create superuser'

    def handle(self, *args, **options):
        # Check connections to both databases
        self.stdout.write('Checking database connections...')
        
        for db in connections:
            try:
                connections[db].ensure_connection()
                self.stdout.write(self.style.SUCCESS(f'Successfully connected to {db} database.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not connect to {db} database: {e}'))
                return

        # Migrate both databases
        self.stdout.write('Running migrations for default database...')
        call_command('migrate', database='default')
        
        self.stdout.write('Running migrations for cars_db database...')
        call_command('migrate', database='cars_db')
        
        # Create superuser
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(username='admin').exists():
            self.stdout.write('Creating admin user...')
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created successfully.'))
        else:
            self.stdout.write('Admin user already exists.')
            
        # Import initial cars data if needed
        self.stdout.write('Importing initial car data...')
        try:
            from cars.parser_integration import import_cars_sync
            count = import_cars_sync(5, admin_user_id=User.objects.get(username='admin').id)
            self.stdout.write(self.style.SUCCESS(f'Imported {count} cars successfully.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing cars: {e}'))
        
        self.stdout.write(self.style.SUCCESS('Database initialization completed!'))