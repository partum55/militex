#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Print environment info for debugging (without sensitive data)
echo "Starting Militex application..."
echo "Running as user: $(whoami)"
echo "Current directory: $(pwd)"
echo "PORT: ${PORT:-8000}"
echo "DEBUG: ${DEBUG:-False}"

# Set default port if not provided
if [ -z "$PORT" ]; then
    PORT=8000
    echo "PORT not set, defaulting to 8000"
fi

# Wait for PostgreSQL database to be available
echo "Checking database connection..."
./wait-for-db.sh

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --no-input

# Create a placeholder image if needed
echo "Ensuring placeholder images exist..."
python create_placeholder_image.py

# Collect static files (in case they weren't collected during build)
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Check if we need to create a superuser
echo "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'partumyt@gmail.com', 'Dr@Mi3rg');
    print('Created superuser: admin');
else:
    print('Superuser already exists');
"

# Check if car data needs to be imported
echo "Checking car import status..."
IMPORT_FLAG_FILE=".car_import_done"
if [ ! -f "$IMPORT_FLAG_FILE" ]; then
    echo "Importing initial car data..."
    python manage.py import_cars --limit 20
    echo "$(date -I)" > "$IMPORT_FLAG_FILE"
else
    echo "Car import already done, skipping."
fi

# Start Gunicorn server
echo "Starting Gunicorn server on 0.0.0.0:${PORT}..."
exec gunicorn militex.wsgi:application --bind "0.0.0.0:${PORT}" \
    --workers=2 \
    --threads=4 \
    --worker-class=gthread \
    --worker-tmp-dir=/dev/shm \
    --log-file=- \
    --access-logfile=- \
    --error-logfile=- \
    --capture-output \
    --log-level=info \
    --max-requests=1000 \
    --max-requests-jitter=50 \
    --timeout=30