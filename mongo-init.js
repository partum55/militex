// mongo-init.js

// Create databases
db = db.getSiblingDB('militex_users');
db.createUser({
  user: 'django_user',
  pwd: 'django_password',
  roles: [
    { role: 'readWrite', db: 'militex_users' }
  ]
});

db = db.getSiblingDB('militex_cars');
db.createUser({
  user: 'django_user',
  pwd: 'django_password',
  roles: [
    { role: 'readWrite', db: 'militex_cars' }
  ]
});

// Create collections
db.createCollection('accounts_user');
db.createCollection('accounts_sellerrating');

db = db.getSiblingDB('militex_cars');
db.createCollection('cars_car');

// Create indexes
db = db.getSiblingDB('militex_users');
db.accounts_user.createIndex({ "username": 1 }, { unique: true });
db.accounts_user.createIndex({ "email": 1 });
db.accounts_sellerrating.createIndex({ "seller_id": 1 });
db.accounts_sellerrating.createIndex({ "rater_id": 1 });

db = db.getSiblingDB('militex_cars');
db.cars_car.createIndex({ "make": 1 });
db.cars_car.createIndex({ "model": 1 });
db.cars_car.createIndex({ "year": 1 });
db.cars_car.createIndex({ "price": 1 });
db.cars_car.createIndex({ "created_at": -1 });
db.cars_car.createIndex({ "seller_id": 1 });