# backend/Makefile

# Variables
PYTHON = python
MANAGE = $(PYTHON) manage.py
MONGO_URI = mongodb://localhost:27017
MONGO_USER = 
MONGO_PASS = 
MONGO_AUTH_SOURCE = admin

# Default target
.PHONY: help
help:
	@echo "Make commands for Militex project:"
	@echo "  make run          - Run development server"
	@echo "  make migrate      - Run Django migrations"
	@echo "  make makemigrations - Create Django migrations"
	@echo "  make superuser    - Create a superuser"
	@echo "  make import-cars  - Import cars from auto.ria.com"
	@echo "  make mongo-setup  - Setup MongoDB databases"
	@echo "  make migrate-to-mongo - Migrate data from SQLite to MongoDB"

# Development server
.PHONY: run
run:
	MONGODB_URI=$(MONGO_URI) MONGODB_USERNAME=$(MONGO_USER) MONGODB_PASSWORD=$(MONGO_PASS) MONGODB_AUTH_SOURCE=$(MONGO_AUTH_SOURCE) $(MANAGE) runserver

# Migrations
.PHONY: migrate
migrate:
	MONGODB_URI=$(MONGO_URI) MONGODB_USERNAME=$(MONGO_USER) MONGODB_PASSWORD=$(MONGO_PASS) MONGODB_AUTH_SOURCE=$(MONGO_AUTH_SOURCE) $(MANAGE) migrate

.PHONY: makemigrations
makemigrations:
	MONGODB_URI=$(MONGO_URI) MONGODB_USERNAME=$(MONGO_USER) MONGODB_PASSWORD=$(MONGO_PASS) MONGODB_AUTH_SOURCE=$(MONGO_AUTH_SOURCE) $(MANAGE) makemigrations

# Create superuser
.PHONY: superuser
superuser:
	MONGODB_URI=$(MONGO_URI) MONGODB_USERNAME=$(MONGO_USER) MONGODB_PASSWORD=$(MONGO_PASS) MONGODB_AUTH_SOURCE=$(MONGO_AUTH_SOURCE) $(MANAGE) createsuperuser

# Import cars
.PHONY: import-cars
import-cars:
	MONGODB_URI=$(MONGO_URI) MONGODB_USERNAME=$(MONGO_USER) MONGODB_PASSWORD=$(MONGO_PASS) MONGODB_AUTH_SOURCE=$(MONGO_AUTH_SOURCE) $(MANAGE) import_cars --limit 10

# MongoDB setup
.PHONY: mongo-setup
mongo-setup:
	@echo "Setting up MongoDB databases..."
	@mongosh --eval "if (!db.getSiblingDB('militex_users').getCollectionNames().length) { print('Creating militex_users database...'); db.getSiblingDB('militex_users').createCollection('accounts_user'); }"
	@mongosh --eval "if (!db.getSiblingDB('militex_cars').getCollectionNames().length) { print('Creating militex_cars database...'); db.getSiblingDB('militex_cars').createCollection('cars_car'); }"
	@echo "MongoDB setup complete."

# Migrate from SQLite to MongoDB
.PHONY: migrate-to-mongo
migrate-to-mongo:
	MONGODB_URI=$(MONGO_URI) MONGODB_USERNAME=$(MONGO_USER) MONGODB_PASSWORD=$(MONGO_PASS) MONGODB_AUTH_SOURCE=$(MONGO_AUTH_SOURCE) $(MANAGE) runscript migrate_to_mongodb