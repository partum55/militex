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
    && apt-get clean

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Install the cronjob
RUN crontab backend/cronjob

# Copy built React frontend
COPY --from=frontend-build /app/frontend/build/ ./backend/frontend_build/

# Collect static files
RUN python backend/manage.py collectstatic --no-input

# Copy supervisor configuration
COPY backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions for cron if needed
RUN chmod 0644 /etc/supervisor/conf.d/supervisord.conf

# Expose the port
EXPOSE 8000

# Start Supervisor
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
