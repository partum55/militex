// Initialize MongoDB databases and collections
print("Starting MongoDB initialization...");

// Authenticate as admin
db.auth('admin', 'admin_password');

// Create militex_users database
db = db.getSiblingDB('militex_users');
try {
    db.createCollection('users');
    print("Created users collection in militex_users database");
} catch (e) {
    print("Collection already exists or error:", e.message);
}

// Create militex_cars database
db = db.getSiblingDB('militex_cars');
try {
    db.createCollection('car');
    print("Created car collection in militex_cars database");
} catch (e) {
    print("Collection already exists or error:", e.message);
}

// Create indexes for better performance
try {
    db.car.createIndex({ "make": 1 });
    db.car.createIndex({ "model": 1 });
    db.car.createIndex({ "year": 1 });
    db.car.createIndex({ "price": 1 });
    db.car.createIndex({ "seller_id": 1 });
    db.car.createIndex({ "created_at": -1 });
    print("Created indexes for car collection");
} catch (e) {
    print("Error creating indexes:", e.message);
}

print("MongoDB initialization complete");