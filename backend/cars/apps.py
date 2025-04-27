from django.apps import AppConfig
from django.conf import settings
import os
import sys

class CarsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cars'

    def ready(self):
        # Only run when the server starts, not during reloading
        if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
            # Ensure placeholder image exists
            try:
                from pathlib import Path
                static_dir = Path(settings.BASE_DIR) / 'static'
                static_dir.mkdir(exist_ok=True)
                images_dir = static_dir / 'images'
                images_dir.mkdir(exist_ok=True)
                placeholder_path = images_dir / 'car-placeholder.jpg'
                
                if not placeholder_path.exists():
                    # Create a very simple empty file as placeholder
                    placeholder_path.touch()
                    print(f"Created empty placeholder at {placeholder_path}")
            except Exception as e:
                print(f"Error ensuring placeholder image: {e}")
            
            # Check if we've already imported today
            import datetime
            flag_file = os.path.join(settings.BASE_DIR, '.car_import_done')
            today = datetime.date.today().isoformat()
            
            run_import = True
            if os.path.exists(flag_file):
                with open(flag_file, 'r') as f:
                    last_import = f.read().strip()
                if last_import == today:
                    run_import = False  # Skip import if already done today
                    print("Car import already done today, skipping")
                else:
                    print(f"Last import was on {last_import}, will import again")
            
            if run_import:
                print("Starting auto-import of cars...")
                # Import directly instead of using call_command
                try:
                    from cars.models import Car
                    if Car.objects.count() > 0:
                        print(f"Database already has {Car.objects.count()} cars, skipping import")
                        run_import = False
                except Exception:
                    pass
                    
                if run_import:
                    try:
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
                            print("Created admin user")
                        
                        count = import_cars_sync(20, admin_user_id=admin_user.id)
                        print(f"Auto-imported {count} cars")
                        
                        # Mark as done
                        with open(flag_file, 'w') as f:
                            f.write(today)
                    except Exception as e:
                        print(f"Error during auto-import: {e}")
