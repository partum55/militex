from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import asyncio

Base = declarative_base()

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    fuel_type = Column(String, nullable=False)
    body_type = Column(String, nullable=False)
    mileage = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    seller_rating = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"))
    
    seller = relationship("Seller", back_populates="cars")

class Seller(Base):
    __tablename__ = "sellers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    additional_info = Column(String, nullable=True)
    
    cars = relationship("Car", back_populates="seller")

# Database connection
DATABASE_URL = "sqlite:///./test_parcing_data.db"
engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Example usage
async def create_sample_data():
    async with AsyncSessionLocal() as session:
        seller = Seller(name="AutoHub", contact_number="+1234567890", additional_info="Trusted dealer")
        session.add(seller)
        await session.commit()
        
        car = Car(name="Toyota Corolla", fuel_type="Petrol", body_type="Sedan", mileage=50000, price=15000.0,
                  seller_rating=4.5, description="Well-maintained car", seller_id=seller.id)
        session.add(car)
        await session.commit()

async def fetch_all_cars():
    async with AsyncSessionLocal() as session:
        result = await session.execute("SELECT * FROM cars")
        cars = result.fetchall()
        for car in cars:
            print(car)

async def main():
    await init_db()
    await create_sample_data()
    await fetch_all_cars()

if __name__ == "__main__":
    asyncio.run(main())
