#!/bin/bash
set -e

# Start PostgreSQL service
pg_ctlcluster 13 main start

# Wait for PostgreSQL to start up
until pg_isready -q; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL started successfully"

# Create database if not exists
su - postgres -c "psql -c \"SELECT 1 FROM pg_database WHERE datname = 'militex'\" | grep -q 1 || psql -c \"CREATE DATABASE militex;\""

# Set password for postgres user
su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'postgres';\""

# Make sure postgres can connect via md5
echo "host all postgres 0.0.0.0/0 md5" >> /etc/postgresql/13/main/pg_hba.conf
echo "host all postgres ::1/128 md5" >> /etc/postgresql/13/main/pg_hba.conf
echo "local all postgres md5" >> /etc/postgresql/13/main/pg_hba.conf

# Restart PostgreSQL to apply changes
pg_ctlcluster 13 main restart

# Wait for PostgreSQL to restart
until pg_isready -q; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL configuration updated successfully"