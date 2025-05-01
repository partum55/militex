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
FROM python:3.9-slim-bullseye
ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    netcat \
    procps \
    gcc \
    python3-dev \
    libpq-dev \
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

# Copy built React frontend
COPY --from=frontend-build /app/frontend/build/ ./backend/frontend_build/

# Collect static files
RUN python backend/manage.py collectstatic --no-input

# Expose port
EXPOSE $PORT

# Command to run by default (can be overridden in docker-compose)
CMD ["gunicorn", "militex.wsgi:application", "--bind", "0.0.0.0:8000", "--chdir", "backend"]