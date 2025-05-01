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
# 2) Python + Django + MongoDB stage
# ───────────────────────────────────────────────────────
FROM python:3.12-slim
ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cron \
    supervisor \
    sqlite3 \
    gnupg \
    curl \
    && apt-get clean

# Install MongoDB (using a simpler, more reliable approach)
RUN apt-get update && apt-get install -y wget && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org && \
    apt-get clean && \
    mkdir -p /data/db && \
    chown -R mongodb:mongodb /data/db

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

# Copy MongoDB initialization script
COPY mongo-init.js /docker-entrypoint-initdb.d/

# Copy our entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Collect static files
RUN python backend/manage.py collectstatic --no-input

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions for supervisor config
RUN chmod 0644 /etc/supervisor/conf.d/supervisord.conf

# Expose the port (Koyeb will use this)
EXPOSE $PORT

# Start services via our entrypoint
ENTRYPOINT ["/entrypoint.sh"]