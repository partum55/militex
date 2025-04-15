from django.apps import AppConfig
import os
import sys

class CarsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cars'

    def ready(self):
        if 'runserver' in sys.argv:
            if os.environ.get('RUN_MAIN') != 'true':
                # Check if we've already imported today
                import datetime
                flag_file = os.path.join(settings.BASE_DIR, '.car_import_done')
                today = datetime.date.today().isoformat()

                if os.path.exists(flag_file):
                    with open(flag_file, 'r') as f:
                        last_import = f.read().strip()
                    if last_import == today:
                        return  # Skip import if already done today

                # Run the import
                from django.core.management import call_command
                call_command('import_cars', limit=20)

                # Mark as done
                with open(flag_file, 'w') as f:
                    f.write(today)
