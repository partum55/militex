# ───────────────────────────────────────────────────────
# 1) Build React frontend
# ───────────────────────────────────────────────────────
FROM node:18-alpine AS frontend
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ───────────────────────────────────────────────────────
# 2) Build final image with Django
# ───────────────────────────────────────────────────────
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       gettext \
       netcat-traditional \
       postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app/backend

# Copy and install Python dependencies first (for better caching)
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy backend code
COPY backend/ ./

# Create directories
RUN mkdir -p /app/backend/media/car_images \
    && mkdir -p /app/backend/static/images \
    && mkdir -p /app/backend/frontend_build/static

# Copy the placeholder script and run it
COPY backend/create_placeholder_image.py ./
RUN python create_placeholder_image.py

# Copy the React build files from the frontend stage
COPY --from=frontend /app/frontend/build /app/backend/frontend_build

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Print environment info\n\
echo "Starting Militex application..."\n\
echo "Running as user: $(whoami)"\n\
echo "Current directory: $(pwd)"\n\
\n\
# Set default port if not provided\n\
if [ -z "$PORT" ]; then\n\
    PORT=8000\n\
    echo "PORT not set, defaulting to 8000"\n\
fi\n\
\n\
# Wait for PostgreSQL to be available\n\
export PGPASSWORD="${DATABASE_PASSWORD:-npg_QRJc0t7HBSNq}"\n\
HOST="${DATABASE_HOST:-ep-small-sunset-a2woub0s.eu-central-1.pg.koyeb.app}"\n\
PORT="${DATABASE_PORT:-5432}"\n\
USER="${DATABASE_USER:-koyeb-adm}"\n\
DB="${DATABASE_NAME:-koyebdb}"\n\
\n\
echo "Waiting for PostgreSQL at $HOST:$PORT..."\n\
until psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "\q" > /dev/null 2>&1; do\n\
  echo "PostgreSQL unavailable - sleeping 2s"\n\
  sleep 2\n\
done\n\
echo "PostgreSQL is up!"\n\
\n\
# Collect static files\n\
echo "Collecting static files..."\n\
python manage.py collectstatic --no-input\n\
\n\
# Apply database migrations\n\
echo "Applying database migrations..."\n\
python manage.py migrate --no-input\n\
\n\
# Check for superuser\n\
echo "Checking for superuser..."\n\
python manage.py shell -c "\n\
from django.contrib.auth import get_user_model;\n\
User = get_user_model();\n\
if not User.objects.filter(username=\"admin\").exists():\n\
    User.objects.create_superuser(\"admin\", \"admin@example.com\", \"admin123\");\n\
    print(\"Created superuser: admin\");\n\
else:\n\
    print(\"Superuser already exists\");\n\
"\n\
\n\
# Import initial cars data if needed\n\
IMPORT_FLAG="/app/backend/.car_import_done"\n\
if [ ! -f "$IMPORT_FLAG" ]; then\n\
    echo "Importing initial car data..."\n\
    python manage.py import_cars --limit 20 --user-id 1 || true\n\
    echo "$(date -I)" > "$IMPORT_FLAG"\n\
else\n\
    echo "Car import already done on $(cat $IMPORT_FLAG)"\n\
fi\n\
\n\
# Start Gunicorn server\n\
echo "Starting Gunicorn server on 0.0.0.0:${PORT}..."\n\
exec gunicorn militex.wsgi:application --bind "0.0.0.0:${PORT}" \\\n\
    --workers=2 \\\n\
    --threads=4 \\\n\
    --worker-class=gthread \\\n\
    --worker-tmp-dir=/dev/shm \\\n\
    --log-file=- \\\n\
    --access-logfile=- \\\n\
    --error-logfile=- \\\n\
    --capture-output \\\n\
    --log-level=info \\\n\
    --max-requests=1000 \\\n\
    --max-requests-jitter=50 \\\n\
    --timeout=30\n\
' > /app/entrypoint.sh \
&& chmod +x /app/entrypoint.sh

# Expose the port
EXPOSE 8000

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]