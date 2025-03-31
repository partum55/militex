from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# Database connection
DATABASE_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(DATABASE_URL)
db = client["car_db"]
cars_collection = db["cars"]
sellers_collection = db["sellers"]

async def init_db():
    """Перевіряє підключення до бази даних."""
    try:
        await client.admin.command("ping")
        print("✅ Connected to MongoDB")
    except Exception as e:
        print("❌ Error connecting to MongoDB:", e)

async def create_sample_data():
    """Створює зразкові дані продавця та авто."""
    seller = {
        "name": "AutoHub",
        "contact_number": "+1234567890",
        "additional_info": "Trusted dealer"
    }
    seller_result = await sellers_collection.insert_one(seller)
    
    car = {
        "name": "Toyota Corolla",
        "fuel_type": "Petrol",
        "body_type": "Sedan",
        "mileage": 50000,
        "price": 15000.0,
        "seller_rating": 4.5,
        "description": "Well-maintained car",
        "seller_id": seller_result.inserted_id
    }
    await cars_collection.insert_one(car)
    print("✅ Sample data inserted")

async def fetch_all_cars():
    """Отримує всі авто з колекції."""
    cars = await cars_collection.find().to_list(length=100)
    return cars

async def main():
    await init_db()
    await create_sample_data()
    cars = await fetch_all_cars()
    print("🚗 Fetched cars:", cars)

if __name__ == "__main__":
    asyncio.run(main())
