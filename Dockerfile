# ──────────────────────────────────────────────────────────────────────────────
# 1) Frontend build stage
# ──────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# copy only package manifests
COPY frontend/package*.json ./
ENV SKIP_PREFLIGHT_CHECK=true
RUN npm ci

# copy source & build
COPY frontend/ ./
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# 2) Python + Django stage
# ──────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim
ENV \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy only the backend code
COPY backend/ ./backend

# copy built React assets into the location Django expects
COPY --from=frontend-build /app/frontend/build/ ./backend/frontend_build/

# collect static assets
RUN python backend/manage.py collectstatic --noinput

# expose & run
EXPOSE 8000

# run migrations then start gunicorn, telling it to chdir into backend
CMD ["sh","-c","python backend/manage.py migrate --noinput && gunicorn militex.wsgi:application --bind 0.0.0.0:8000 --chdir backend"]
