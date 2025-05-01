#!/bin/bash
set -e

# Initialize MongoDB data directory if needed
mkdir -p /data/db
chown -R mongodb:mongodb /data/db

# Export MongoDB environment variables for Django
export MONGODB_URI=mongodb://localhost:27017
export MONGODB_USERNAME=admin
export MONGODB_PASSWORD=admin_password
export MONGODB_AUTH_SOURCE=admin


# Create log directory and file if they don't exist
mkdir -p /var/log
touch /var/log/supervisord.log
chmod 666 /var/log/supervisord.log

echo "Starting all services with supervisord..."
# Start supervisord but don't wait for it (background)
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &

# Give MongoDB some time to start
echo "Waiting for MongoDB to start..."
sleep 5

# Wait for MongoDB to be ready
timeout=30
counter=0
until mongo --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 1
  counter=$((counter+1))
  if [ $counter -ge $timeout ]; then
    echo "ERROR: Timed out waiting for MongoDB to start."
    exit 1
  fi
  echo "Waiting for MongoDB... $counter/$timeout"
done
echo "MongoDB is ready!"

# Create admin user (ignore error if already exists)
echo "Creating MongoDB admin user..."
mongo admin --eval "db.createUser({user: 'admin', pwd: 'admin_password', roles: ['root']})" || true

# Initialize militex_users database
echo "Initializing militex_users database..."
mongo admin -u admin -p admin_password --eval '
  db = db.getSiblingDB("militex_users");
  try {
    db.createCollection("users");
    print("Created users collection");
  } catch(e) {
    print("Users collection already exists or error:", e);
  }
'

# Initialize militex_cars database
echo "Initializing militex_cars database..."
mongo admin -u admin -p admin_password --eval '
  db = db.getSiblingDB("militex_cars");
  try {
    db.createCollection("car");
    print("Created car collection");
  } catch(e) {
    print("Car collection already exists or error:", e);
  }
  
  // Create indexes
  try {
    db.car.createIndex({ "make": 1 });
    db.car.createIndex({ "model": 1 });
    db.car.createIndex({ "year": 1 });
    db.car.createIndex({ "price": 1 });
    db.car.createIndex({ "seller_id": 1 });
    db.car.createIndex({ "created_at": -1 });
    print("Created car collection indexes");
  } catch(e) {
    print("Index creation error:", e);
  }
'

echo "MongoDB initialization complete."
echo "All services are running. Container is ready."

# Keep container running by tailing the supervisord log
exec tail -f /var/log/supervisord.log