#!/bin/bash
set -e

# Ensure directories exist with proper permissions
mkdir -p /data/db
chown -R mongodb:mongodb /data/db

# Try to start MongoDB with retry logic
echo "Starting MongoDB..."
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db || true

# Wait for MongoDB to be ready (with more relaxed checking)
echo "Waiting for MongoDB to start..."
max_tries=10
count=0
while [ $count -lt $max_tries ]; do
    if mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        echo "MongoDB started successfully"
        break
    fi

    echo "Retrying MongoDB connection (attempt $count of $max_tries)..."
    sleep 2
    count=$((count + 1))

    # If we've tried a few times, try restarting MongoDB
    if [ $count -eq 5 ]; then
        echo "Restarting MongoDB..."
        pkill mongod || true
        sleep 2
        mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db || true
    fi
done

# If we couldn't start MongoDB properly, still continue
# This allows the app to at least start and possibly use SQLite instead
if [ $count -ge $max_tries ]; then
    echo "Warning: MongoDB may not be running properly, but continuing anyway"
fi

# Set environment variables for Django
export MONGODB_URI=mongodb://localhost:27017
export MONGODB_USERNAME=admin
export MONGODB_PASSWORD=admin_password
export MONGODB_AUTH_SOURCE=admin

# Adjust PORT if needed (Koyeb may provide this)
if [ -n "$PORT" ]; then
    echo "Using PORT: $PORT"
else
    echo "PORT not set, defaulting to 8000"
    export PORT=8000
fi

# Apply Django migrations (with retry logic)
echo "Applying Django migrations..."
python backend/manage.py migrate --noinput || echo "Migration failed, but continuing"

# Start supervisor which manages all our processes
echo "Starting supervisord..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf