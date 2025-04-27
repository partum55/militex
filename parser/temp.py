import requests
from bs4 import BeautifulSoup
import asyncio
import re
from parcing_cars_saving import Car, Seller, AsyncSessionLocal, init_db
from sqlalchemy.future import select

headers = {"User-Agent": "Mozilla/5.0"}

BASE_URL = 'https://auto.ria.com/uk/search/?indexName=auto&body.id[0]=5&category_id=1&page=1'

# Helper functions to map Ukrainian values to standardized values
def map_fuel_type(fuel_text):
    fuel_text = fuel_text.lower()
    if 'дизель' in fuel_text:
        return "diesel"
    elif 'електро' in fuel_text:
        return "electric"
    elif 'гібрид' in fuel_text:
        return "hybrid"
    elif 'газ' in fuel_text:
        return "gas"
    else:
        # Default to gasoline
        return "gasoline"

def map_condition(condition_text):
    condition_text = condition_text.lower()
    if 'нов' in condition_text:
        return "new"
    elif 'пошкодж' in condition_text or 'після дтп' in condition_text:
        return "damaged"
    else:
        # Default to used
        return "used"

def map_transmission(transmission_text):
    transmission_text = transmission_text.lower()
    if 'автомат' in transmission_text:
        return "automatic"
    elif 'роботизована' in transmission_text or 'типтронік' in transmission_text:
        return "semi-automatic"
    else:
        # Default to manual
        return "manual"

def map_body_type(body_type_text):
    # Default since we're mainly searching for SUVs
    return "suv"

def get_suv_links(limit=100):
    response = requests.get(BASE_URL, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    links = []
    for a in soup.select('a.address[href]'):
        href = a['href']
        if href.startswith('https://auto.ria.com'):
            links.append(href)
        if len(links) >= limit:
            break
    return links

def extract_from_labels(soup, label_name):
    blocks = soup.select("div.technical-info span.label")
    for label in blocks:
        if label_name.lower() in label.get_text(strip=True).lower():
            argument = label.find_next_sibling("span", class_="argument")
            return argument.get_text(strip=True) if argument else "Невідомо"
    return "Невідомо"

def extract_description(soup):
    desc_tag = soup.select_one("dd.additional-data.show-line")
    return desc_tag.get_text(strip=True) if desc_tag else "Опис відсутній"

def parse_car_details(url):
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")

    title = soup.select_one("h1.head")
    if not title:
        return None
    title_text = title.get_text(strip=True)

    year_match = re.search(r"\b(19|20)\d{2}\b", title_text)
    year = year_match.group(0) if year_match else "Невідомо"

    title_parts = title_text.replace(year, "").strip().split()
    car_make = title_parts[0] if len(title_parts) >= 1 else "Невідомо"
    model = " ".join(title_parts[1:]) if len(title_parts) > 1 else "Невідомо"

    mileage_tag = soup.find("span", string=lambda s: s and "тис. км" in s)
    mileage = int(mileage_tag.get_text(strip=True).replace("тис. км", "").strip()) * 1000 if mileage_tag else 0

    description = extract_description(soup)
    fuel_type_raw = extract_from_labels(soup, "Двигун")
    
    # Map raw text to standardized values
    if fuel_type_raw and '•' in fuel_type_raw:
        fuel_text = fuel_type_raw.split('•')[-1].strip()
        fuel_type = map_fuel_type(fuel_text)
    elif fuel_type_raw:
        fuel_text = fuel_type_raw.strip()
        fuel_type = map_fuel_type(fuel_text)
    else:
        fuel_type = "gasoline"  # Default
    
    transmission_raw = extract_from_labels(soup, "коробка передач")
    transmission = map_transmission(transmission_raw) if transmission_raw != "Невідомо" else "manual"
    
    body_type = map_body_type("Позашляховик / Кросовер")  # We're specifically looking at SUVs
    
    condition_tag = soup.find("span", class_="label", string=re.compile("Технічний стан", re.IGNORECASE))
    if condition_tag:
        condition_span = condition_tag.find_next("span", class_="argument")
        condition_text = condition_span.get_text(strip=True) if condition_span else "Невідомо"
        condition = map_condition(condition_text)
    else:
        condition = "used"  # Default

    price_tag = soup.find("div", class_="price_value") or soup.find("strong", class_="bold green size22")
    if price_tag:
        price_text = price_tag.get_text(strip=True)
        price_match = re.search(r"\d[\d\s,]*", price_text)
        price = float(price_match.group(0).replace(" ", "").replace(",", "")) if price_match else 0.0
    else:
        price = 0.0

    return {
        "name": f"{car_make} {model}",
        "year": year,
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
    links = get_suv_links(limit=100)
    for link in links:
        car_data = parse_car_details(link)
        if car_data:
            await save_car_to_db(car_data)
            print(f"[✔️] Збережено: {car_data['name']} ({car_data['year']}) | {car_data['price']}$")
            print(f"   ➤ Паливо: {car_data['fuel_type']} | Кузов: {car_data['body_type']} | КПП: {car_data['transmission']}")
            print(f"   ➤ Стан: {car_data['condition']}")
            print(f"   ➤ {car_data['description'][:100]}...\n")

if __name__ == "__main__":
    asyncio.run(main())
