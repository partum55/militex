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
# 2) Build final image with Django and PostgreSQL support
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app/backend

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install psycopg2-binary \
    && pip install -r requirements.txt

# Copy backend code
COPY backend/ ./

# Create media directory for file uploads
RUN mkdir -p /app/backend/media/car_images

# Copy the React build files from the frontend stage
COPY --from=frontend /app/frontend/build /app/backend/frontend_build

# Collect static files
RUN python manage.py collectstatic --no-input

# Expose the port
EXPOSE 8000

# Create entrypoint script
RUN echo '#!/bin/bash\n\
python manage.py migrate --no-input\n\
gunicorn militex.wsgi:application --bind 0.0.0.0:8000\n\
' > /app/entrypoint.sh \
&& chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]