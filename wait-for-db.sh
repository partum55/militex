#!/bin/bash
# wait-for-db.sh

set -e

echo "Waiting for PostgreSQL to be ready..."

# Extract values from Django settings or environment variables
if [ -z "$DATABASE_URL" ]; then
  # These will be set by Koyeb
  HOST="${DATABASE_HOST:-ep-small-sunset-a2woub0s.eu-central-1.pg.koyeb.app}"
  PORT="${DATABASE_PORT:-5432}"
  USER="${DATABASE_USER:-koyeb-adm}"
  PASSWORD="${DATABASE_PASSWORD:-npg_QRJc0t7HBSNq}"
  DB="${DATABASE_NAME:-koyebdb}"
else
  # Parse from DATABASE_URL if available
  echo "Using DATABASE_URL for connection info"
fi

# Wait until PostgreSQL is ready
export PGPASSWORD=$PASSWORD
until psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - continuing"