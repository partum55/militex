#!/bin/bash
# wait-for-db.sh

set -e

# Load database configuration from Django settings
HOST=$(python -c "from django.conf import settings; print(settings.DATABASES['default']['HOST'])")
PORT=$(python -c "from django.conf import settings; print(settings.DATABASES['default'].get('PORT', 5432))")
USER=$(python -c "from django.conf import settings; print(settings.DATABASES['default']['USER'])")
PASSWORD=$(python -c "from django.conf import settings; print(settings.DATABASES['default']['PASSWORD'])")
DB=$(python -c "from django.conf import settings; print(settings.DATABASES['default']['NAME'])")

# Set default port if none is provided
if [ -z "$PORT" ]; then
  PORT=5432
fi

echo "Waiting for PostgreSQL to be ready at $HOST:$PORT..."

# Function to check if PostgreSQL is ready
function check_postgres() {
  PGPASSWORD=$PASSWORD psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT 1" >/dev/null 2>&1
  return $?
}

# Wait until PostgreSQL is ready
until check_postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing command"
exec "$@"