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
# 2) Python + Django stage with MongoDB
# ───────────────────────────────────────────────────────
# Use older Python image based on Debian Bullseye
FROM python:3.9-slim-bullseye
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
    wget \
    netcat \
    && apt-get clean

# MongoDB installation (should work on bullseye)
RUN wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian bullseye/mongodb-org/5.0 main" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list && \
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
RUN mkdir -p backend/static/images && touch backend/static/images/car-placeholder.jpg

# Setup cron job
RUN echo "*/5 * * * * cd /app && /usr/local/bin/python backend/manage.py runscript import_parsed_data >> /var/log/cron_import.log 2>&1" > /etc/cron.d/car_import_job
RUN chmod 0644 /etc/cron.d/car_import_job
RUN crontab /etc/cron.d/car_import_job

# Create log file for cron
RUN touch /var/log/cron_import.log && chmod 666 /var/log/cron_import.log

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
    echo '[program:mongodb]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=mongod --bind_ip 127.0.0.1 --port 27017 --dbpath /data/db' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'priority=5' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'startretries=5' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'user=mongodb' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:gunicorn]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=gunicorn militex.wsgi:application --bind 0.0.0.0:%(ENV_PORT)s --chdir backend --timeout 120' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'priority=20' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'startretries=10' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:cron]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=cron -f' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'priority=30' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf

# Create entrypoint script with improved MongoDB initialization
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Initialize MongoDB data directory if needed\n\
mkdir -p /data/db\n\
chown -R mongodb:mongodb /data/db\n\
\n\
# Export MongoDB environment variables for Django\n\
export MONGODB_URI=mongodb://localhost:27017\n\
export MONGODB_USERNAME=admin\n\
export MONGODB_PASSWORD=admin_password\n\
export MONGODB_AUTH_SOURCE=admin\n\
\n\
echo "Starting all services with supervisord..."\n\
# Start supervisord but dont wait for it (background)\n\
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &\n\
\n\
# Give MongoDB some time to start\n\
echo "Waiting for MongoDB to start..."\n\
sleep 5\n\
\n\
# Wait for MongoDB to be ready\n\
timeout=30\n\
counter=0\n\
until mongo --eval "db.adminCommand({ping:1})" localhost:27017/test >/dev/null 2>&1; do\n\
  sleep 1\n\
  counter=$((counter+1))\n\
  if [ $counter -ge $timeout ]; then\n\
    echo "ERROR: Timed out waiting for MongoDB to start."\n\
    exit 1\n\
  fi\n\
  echo "Waiting for MongoDB... $counter/$timeout"\n\
done\n\
echo "MongoDB is ready!"\n\
\n\
# Create admin user (ignore error if already exists)\n\
echo "Creating MongoDB admin user..."\n\
mongo admin --eval "db.createUser({user: \"admin\", pwd: \"admin_password\", roles: [{role: \"root\", db: \"admin\"}]})" || true\n\
\n\
# Initialize militex_users database\n\
echo "Initializing militex_users database..."\n\
mongo admin -u admin -p admin_password --eval '\n\
  db = db.getSiblingDB("militex_users");\n\
  try {\n\
    db.createCollection("users");\n\
    print("Created users collection");\n\
  } catch(e) {\n\
    print("Users collection already exists or error:", e);\n\
  }\n\
'\n\
\n\
# Initialize militex_cars database\n\
echo "Initializing militex_cars database..."\n\
mongo admin -u admin -p admin_password --eval '\n\
  db = db.getSiblingDB("militex_cars");\n\
  try {\n\
    db.createCollection("car");\n\
    print("Created car collection");\n\
  } catch(e) {\n\
    print("Car collection already exists or error:", e);\n\
  }\n\
  \n\
  // Create indexes\n\
  try {\n\
    db.car.createIndex({ "make": 1 });\n\
    db.car.createIndex({ "model": 1 });\n\
    db.car.createIndex({ "year": 1 });\n\
    db.car.createIndex({ "price": 1 });\n\
    db.car.createIndex({ "seller_id": 1 });\n\
    db.car.createIndex({ "created_at": -1 });\n\
    print("Created car collection indexes");\n\
  } catch(e) {\n\
    print("Index creation error:", e);\n\
  }\n\
'\n\
\n\
echo "MongoDB initialization complete."\n\
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