import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
import requests
import tempfile
from cars.parser_integration import import_cars_sync

class Command(BaseCommand):
    help = 'Import cars from auto.ria.com'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Limit the number of cars to import'
        )
        parser.add_argument(
            '--user-id',
            type=int,
            default=1,
            help='User ID to use as the seller (default: 1)'
        )

    def handle(self, *args, **kwargs):
        limit = kwargs['limit']
        user_id = kwargs['user_id']
        
        self.stdout.write(f"Starting import of up to {limit} cars...")
        
        try:
            count = import_cars_sync(limit=limit, admin_user_id=user_id)
            self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} cars"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error importing cars: {e}"))
