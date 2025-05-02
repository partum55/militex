#!/bin/bash
set -e

# Create log directory and file if they don't exist
mkdir -p /var/log
touch /var/log/supervisord.log
chmod 666 /var/log/supervisord.log

echo "Starting all services with supervisord..."
# Start supervisord in foreground
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n