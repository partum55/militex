# Base image using Python 3.12
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV NODE_OPTIONS=--max_old_space_size=4096
# Add this env var to skip the Create React App preflight check
ENV SKIP_PREFLIGHT_CHECK=true

# Set work directory
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js for frontend building (using a more recent version)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify Node.js and npm versions
RUN node --version && npm --version

# Copy package.json and package-lock.json first to leverage Docker caching
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend

# Create .env file with SKIP_PREFLIGHT_CHECK=true
RUN echo "SKIP_PREFLIGHT_CHECK=true" > .env

RUN npm ci

# Copy the rest of the project
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Move built files to Django static directory
WORKDIR /app
RUN mkdir -p /app/backend/staticfiles/react
RUN cp -r /app/frontend/build/* /app/backend/staticfiles/react/

# Return to app directory
WORKDIR /app

# Collect static files
RUN cd backend && python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Command to run
CMD ["sh", "-c", "cd backend && python manage.py migrate && gunicorn militex.wsgi:application --bind 0.0.0.0:8000"]