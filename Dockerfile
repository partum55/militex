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
# 2) Python + Django stage (without MongoDB)
# ───────────────────────────────────────────────────────
FROM python:3.9-slim-bullseye
ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies (minimal, no MongoDB)
RUN apt-get update && apt-get install -y \
    supervisor \
    curl \
    netcat \
    procps \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Create media directories with proper permissions
RUN mkdir -p backend/media/car_images && chmod -R 755 backend/media

# Create a placeholder image
RUN mkdir -p backend/static/images && touch backend/static/images/car-placeholder.jpg

# Create log files
RUN touch /var/log/app.log && chmod 666 /var/log/app.log

# Copy built React frontend
COPY --from=frontend-build /app/frontend/build/ ./backend/frontend_build/

# Create healthcheck script for web application
RUN echo '#!/bin/bash\n\
nc -z -w3 localhost 8000 || exit 1\n\
' > /healthcheck.sh && chmod +x /healthcheck.sh

# Create supervisor configuration inline
RUN echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'logfile=/var/log/supervisord.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'loglevel=info' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:migrate]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=python backend/manage.py migrate --noinput' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'priority=10' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'startsecs=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=false' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'exitcodes=0,1,2' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:gunicorn]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=gunicorn militex.wsgi:application --bind 0.0.0.0:%(ENV_PORT)s --chdir backend --timeout 300' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'priority=20' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'startretries=10' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting all services with supervisord..."\n\
# Start supervisord\n\
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &\n\
\n\
echo "All services are running. Container is ready."\n\
\n\
# Keep container running by tailing the supervisord log\n\
exec tail -f /var/log/supervisord.log\n\
' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Collect static files
RUN python backend/manage.py collectstatic --no-input

# Add Docker healthcheck for web app only
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD /healthcheck.sh

# Expose only the web app port
EXPOSE $PORT

# Set the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]