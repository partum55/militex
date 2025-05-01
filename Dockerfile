# ───────────────────────────────────────────────────────
# 1) Build React frontend
# ───────────────────────────────────────────────────────
FROM node:18-alpine AS frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# ───────────────────────────────────────────────────────
# 2) Build Django + MongoDB image
# ───────────────────────────────────────────────────────
FROM python:3.10-slim

# 1. Set working directory
WORKDIR /app/backend

# 2. Install system dependencies
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      supervisor \
      mongodb \
 && rm -rf /var/lib/apt/lists/* \
 # 3. Create MongoDB data dir
 && mkdir -p /data/db

# 4. Bring in compiled frontend into Django’s template folder
COPY --from=frontend /app/frontend/build ../frontend_build

# 5. Install Python deps
COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
 && pip install -r requirements.txt

# 6. Copy the rest of your Django project
COPY backend/ ./

# 7. Copy Supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 8. Collect static files (so WhiteNoise can serve them)
RUN python manage.py collectstatic --no-input

# 9. Expose Django’s port
EXPOSE 8000

# 10. Start everything under Supervisor
CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
