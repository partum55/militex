import requests
from bs4 import BeautifulSoup
import asyncio
from parcing_cars_saving import Car, Seller, AsyncSessionLocal, init_db
from sqlalchemy.future import select

headers = {"User-Agent": "Mozilla/5.0"}

def get_suv_links(limit=5):
    BASE_URL = 'https://auto.ria.com/uk/search/'
    params = {
        'body.id[0]': 5,
        'indexName': 'auto',
        'category_id': 1,
        'page': 1
    }

    response = requests.get(BASE_URL, params=params, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    links = []
    for a in soup.select('a.address[href]'):
        href = a['href']
        if href.startswith('https://auto.ria.com'):
            links.append(href)
        if len(links) >= limit:
            break
    return links

def parse_car_details(url):
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")

    title = soup.select_one("h1.head")
    if not title:
        return None

    title_text = title.get_text(strip=True)
    year = title_text.split()[-1]

    mileage_tag = soup.find("span", string=lambda s: s and "тис. км" in s)
    mileage = int(mileage_tag.get_text(strip=True).replace("тис. км", "").strip()) * 1000 if mileage_tag else 0

    desc_tag = soup.select_one("div.full-description")
    description = desc_tag.get_text(strip=True) if desc_tag else ""

    characteristics = soup.select("dl.characteristic div")
    char_map = {}
    for i in range(0, len(characteristics), 2):
        key = characteristics[i].get_text(strip=True)
        value = characteristics[i + 1].get_text(strip=True)
        char_map[key] = value

    car_make = char_map.get("Марка", "N/A")
    model = char_map.get("Модель", "N/A")
    fuel_type = char_map.get("Тип пального", "N/A")
    transmission = char_map.get("Коробка передач", "N/A")
    body_type = char_map.get("Тип кузова", "Позашляховик")
    condition = char_map.get("Стан", "Використовуване")
    price_tag = soup.select_one(".price_value")
    price = float(price_tag.get_text(strip=True).replace("$", "").replace(" ", "").replace(",", "")) if price_tag else 0.0

    return {
        "name": f"{car_make} {model} {year}",
        "fuel_type": fuel_type,
        "body_type": body_type,
        "mileage": mileage,
        "price": price,
        "description": description,
        "condition": condition,
        "transmission": transmission
    }

async def save_car_to_db(car_data):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Seller).where(Seller.name == "AutoRia"))
        seller = result.scalar_one_or_none()

        if not seller:
            seller = Seller(name="AutoRia", contact_number="N/A", additional_info="Дані з auto.ria.com")
            session.add(seller)
            await session.commit()

        car = Car(
            name=car_data["name"],
            fuel_type=car_data["fuel_type"],
            body_type=car_data["body_type"],
            mileage=car_data["mileage"],
            price=car_data["price"],
            seller_rating=5.0,
            description=car_data["description"],
            seller_id=seller.id
        )
        session.add(car)
        await session.commit()

async def main():
    await init_db()
    links = get_suv_links(limit=5)
    for link in links:
        car_data = parse_car_details(link)
        if car_data:
            await save_car_to_db(car_data)
            print(f"[✔️] Збережено: {car_data['name']}")

if name == "main":
    asyncio.run(main())