import asyncio
from parcing_cars_saving_MongoDB import init_db, create_sample_data, fetch_all_cars

async def main():
    await init_db()
    await create_sample_data()
    cars = await fetch_all_cars()
    for car in cars:
        print(car)

if __name__ == "__main__":
    asyncio.run(main())
