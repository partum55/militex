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
# 2) Python + Django stage
# ───────────────────────────────────────────────────────
FROM python:3.12-slim
ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cron \
    supervisor \
    sqlite3 \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Create media directories with proper permissions
RUN mkdir -p backend/media/car_images && chmod -R 755 backend/media

# Create a placeholder image
RUN touch backend/static/images/car-placeholder.jpg

# Setup cron job
RUN echo "*/2 * * * * cd /app && /usr/local/bin/python backend/manage.py runscript import_parsed_data >> /var/log/cron_import.log 2>&1" > /etc/cron.d/car_import_job
RUN chmod 0644 /etc/cron.d/car_import_job
RUN crontab /etc/cron.d/car_import_job

# Create log file for cron
RUN touch /var/log/cron_import.log && chmod 666 /var/log/cron_import.log

# Copy built React frontend
COPY --from=frontend-build /app/frontend/build/ ./backend/frontend_build/

# Collect static files
RUN python backend/manage.py collectstatic --no-input

# Copy supervisor configuration
COPY backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions for supervisor config
RUN chmod 0644 /etc/supervisor/conf.d/supervisord.conf

# Expose the port
EXPOSE 8000

# Start Supervisor
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]