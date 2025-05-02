# ───────────────────────────────────────────────────────
# 1) Frontend build stage
# ───────────────────────────────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
ENV SKIP_PREFLIGHT_CHECK=true
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ───────────────────────────────────────────────────────
# 2) Python + Django stage - use Python 3.11 for better compatibility
# ───────────────────────────────────────────────────────
FROM python:3.11-slim-bullseye
ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies including cron
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    netcat \
    procps \
    gcc \
    python3-dev \
    libpq-dev \
    cron \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Create media directories with proper permissions
RUN mkdir -p backend/media/car_images backend/media/fundraiser_images && chmod -R 755 backend/media

# Create static directories and placeholder image
RUN mkdir -p backend/static/images && touch backend/static/images/car-placeholder.jpg

# Copy built React frontend
COPY --from=frontend-build /app/frontend/build/ ./backend/frontend_build/

# Create necessary directories for static files
RUN mkdir -p backend/staticfiles

# Run migrations on startup and collect static files
RUN chmod +x backend/manage.py
RUN python backend/manage.py collectstatic --noinput

# Set up cron job to run every 10 minutes
RUN echo "*/10 * * * * cd /app/backend && /usr/local/bin/python manage.py runscript import_parsed_data >> /var/log/cron_import.log 2>&1" > /etc/cron.d/import_cars
RUN chmod 0644 /etc/cron.d/import_cars
RUN crontab /etc/cron.d/import_cars
RUN mkdir -p /var/log && touch /var/log/cron_import.log && chmod 0666 /var/log/cron_import.log

# Create a startup script that starts both the web server and cron
RUN echo '#!/bin/bash\n\
# Start cron service\n\
service cron start\n\
echo "Cron service started..."\n\
\n\
# Run Django migrations\n\
echo "Running database migrations..."\n\
python backend/manage.py migrate --noinput\n\
\n\
# Start Gunicorn\n\
echo "Starting Gunicorn server..."\n\
exec gunicorn militex.wsgi:application --bind 0.0.0.0:$PORT --chdir backend --workers 2 --timeout 120\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE $PORT

# Command to run app
CMD ["/app/start.sh"]