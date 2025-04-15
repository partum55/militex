import requests
from bs4 import BeautifulSoup
import re
import asyncio
import tempfile
import os
from urllib.parse import urlparse
from asgiref.sync import sync_to_async
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from .models import Car, CarImage

User = get_user_model()

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
BASE_URL = 'https://auto.ria.com/uk/search/?indexName=auto&body.id[0]=5&category_id=1&page=1'

def get_suv_links(limit=100):
    """Get links to SUV car listings from auto.ria.com"""
    links = []
    page = 1
    
    while len(links) < limit:
        url = BASE_URL.replace('page=1', f'page={page}')
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all car links on the page
        for a in soup.select('a.address[href]'):
            href = a['href']
            if href.startswith('https://auto.ria.com'):
                links.append(href)
                if len(links) >= limit:
                    break
        
        # Move to next page if we need more links
        page += 1
        # Check if there's a next page
        next_page = soup.select_one('span.page-item.next a')
        if not next_page or len(links) >= limit:
            break
    
    return links[:limit]

def extract_from_labels(soup, label_name):
    """Extract information from labeled technical specifications"""
    blocks = soup.select("div.technical-info span.label")
    for label in blocks:
        if label_name.lower() in label.get_text(strip=True).lower():
            argument = label.find_next_sibling("span", class_="argument")
            return argument.get_text(strip=True) if argument else None
    return None

def extract_description(soup):
    """Extract car description from the page"""
    desc_tag = soup.select_one("dd.additional-data.show-line")
    if desc_tag:
        return desc_tag.get_text(strip=True)
    
    # Try alternative selectors if the first one didn't work
    alt_desc = soup.select_one("div.additional-data")
    if alt_desc:
        return alt_desc.get_text(strip=True)
    
    return ""

def extract_image_urls(soup, limit=5):
    """Extract car image URLs from the page"""
    image_urls = []
    
    # Try to find images in gallery
    image_tags = soup.select('div.gallery-order img.outline')
    if not image_tags:
        # Try alternative selectors
        image_tags = soup.select('div.photo-620x465 img')
    
    for img in image_tags[:limit]:
        src = img.get('src') or img.get('data-src')
        if src and not src.endswith('no_photo.png'):
            # Convert to full-size image URL if needed
            if 'auto.ria.com' in src and 'small' in src:
                src = src.replace('small', 'big')
            image_urls.append(src)
    
    return image_urls

def extract_price(soup):
    """Extract price from the page with better handling of different formats"""
    price_tag = soup.find("div", class_="price_value") or soup.find("strong", class_="bold green size22")
    price = 0.0
    
    if price_tag:
        price_text = price_tag.get_text(strip=True)
        # Try to handle both dollar and euro formats
        price_match = re.search(r"\d[\d\s,\.]*", price_text)
        if price_match:
            price_str = price_match.group(0).replace(" ", "").replace(",", ".")
            try:
                price = float(price_str)
                # If price is in euros or another currency, convert approximately to USD
                if '€' in price_text:
                    price *= 1.1  # Approximate EUR to USD conversion
            except ValueError:
                price = 0.0
    
    return price

def parse_car_details(url):
    """Parse car details from auto.ria.com listing"""
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()  # Raise exception for HTTP errors
        soup = BeautifulSoup(r.text, "html.parser")

        title = soup.select_one("h1.head")
        if not title:
            return None
        title_text = title.get_text(strip=True)

        # Extract year
        year_match = re.search(r"\b(19|20)\d{2}\b", title_text)
        year = int(year_match.group(0)) if year_match else 0

        # Extract make and model
        title_parts = title_text.replace(str(year) if year else "", "").strip().split()
        car_make = title_parts[0] if len(title_parts) >= 1 else "Unknown"
        model = " ".join(title_parts[1:]) if len(title_parts) > 1 else "Unknown"

        # Extract mileage
        mileage_tag = soup.find("span", string=lambda s: s and "тис. км" in s)
        mileage = 0
        if mileage_tag:
            mileage_text = mileage_tag.get_text(strip=True).replace("тис. км", "").strip()
            try:
                mileage = int(float(mileage_text.replace(",", ".")) * 1000)
            except ValueError:
                mileage = 0

        description = extract_description(soup)
        
        # Extract fuel type
        fuel_type_raw = extract_from_labels(soup, "Двигун")
        fuel_type = "gasoline"  # Default value
        if fuel_type_raw:
            fuel_text = fuel_type_raw.lower()
            if 'дизель' in fuel_text:
                fuel_type = "diesel"
            elif 'електро' in fuel_text:
                fuel_type = "electric"
            elif 'гібрид' in fuel_text:
                fuel_type = "hybrid"
            elif 'газ' in fuel_text:
                fuel_type = "gas"
        
        # Extract transmission
        transmission_raw = extract_from_labels(soup, "коробка передач")
        transmission = "manual"  # Default value
        if transmission_raw:
            if 'автомат' in transmission_raw.lower():
                transmission = "automatic"
            elif 'роботизована' in transmission_raw.lower() or 'типтроник' in transmission_raw.lower():
                transmission = "semi-automatic"
        
        # Extract body type
        body_type_raw = extract_from_labels(soup, "Тип кузова")
        body_type = "suv"  # Default since we're filtering for SUVs
        if body_type_raw:
            body_text = body_type_raw.lower()
            if 'седан' in body_text:
                body_type = "sedan"
            elif 'універсал' in body_text:
                body_type = "estate"
            elif 'хетчбек' in body_text:
                body_type = "hatchback"
            elif 'купе' in body_text:
                body_type = "coupe"
            elif 'ліфтбек' in body_text:
                body_type = "liftback"
        
        # Extract condition
        condition_tag = soup.find("span", class_="label", string=re.compile("Технічний стан", re.IGNORECASE))
        condition = "used"  # Default value
        if condition_tag:
            condition_span = condition_tag.find_next("span", class_="argument")
            condition_text = condition_span.get_text(strip=True).lower() if condition_span else ""
            if 'нова' in condition_text:
                condition = "new"
            elif 'пошкодж' in condition_text:
                condition = "damaged"
        
        # Extract price
        price = extract_price(soup)
        
        # Extract location
        location_tag = soup.select_one("div.item_region span.region")
        location = location_tag.get_text(strip=True) if location_tag else "Unknown"
        
        city, country = "Unknown", "Ukraine"  # Default values
        if location:
            location_parts = location.split(',')
            city = location_parts[0].strip()
            if len(location_parts) > 1:
                country = location_parts[-1].strip()
        
        # Extract engine details
        engine_size = 0.0
        engine_power = 0
        
        engine_info = extract_from_labels(soup, "Двигун")
        if engine_info:
            # Try to extract engine size (in liters)
            size_match = re.search(r"(\d+(?:\.\d+)?)\s*л", engine_info)
            if size_match:
                try:
                    engine_size = float(size_match.group(1))
                except ValueError:
                    pass
            
            # Try to extract engine power (in hp)
            power_match = re.search(r"(\d+)\s*к\.с\.", engine_info)
            if power_match:
                try:
                    engine_power = int(power_match.group(1))
                except ValueError:
                    pass
        
        # Extract images
        image_urls = extract_image_urls(soup)
        
        return {
            "make": car_make,
            "model": model,
            "year": year,
            "mileage": mileage,
            "fuel_type": fuel_type,
            "transmission": transmission,
            "body_type": body_type,
            "condition": condition,
            "price": price,
            "description": description,
            "country": country,
            "city": city,
            "vehicle_type": "SUV",  # We're filtering for SUVs in the URL
            "negotiable": True,
            "engine_size": engine_size,
            "engine_power": engine_power,
            "image_urls": image_urls,
            "source_url": url
        }
    except Exception as e:
        print(f"Error parsing car details from {url}: {e}")
        return None

async def download_image(url):
    """Download image from URL and return as ContentFile"""
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Get file extension from URL
        parsed_url = urlparse(url)
        path = parsed_url.path
        ext = os.path.splitext(path)[1].lower()
        if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            ext = '.jpg'  # Default to .jpg if no extension is found
        
        # Create a ContentFile with the image data
        content_file = ContentFile(response.content, name=f"car_image{ext}")
        return content_file
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

async def import_cars_from_autoria(limit=20, admin_user_id=1):
    """Import cars from auto.ria.com and save to the database"""
    links = get_suv_links(limit=limit)
    imported_count = 0
    
    # Get admin user to set as the seller
    user = await sync_to_async(User.objects.get)(id=admin_user_id)
    
    for link in links:
        car_data = parse_car_details(link)
        if not car_data:
            continue
            
        # Check if car with same make, model and year already exists
        existing_car = await sync_to_async(lambda: Car.objects.filter(
            make=car_data["make"],
            model=car_data["model"],
            year=car_data["year"],
            mileage=car_data["mileage"]
        ).first())()
        
        if existing_car:
            print(f"[SKIP] Car already exists: {car_data['make']} {car_data['model']} ({car_data['year']})")
            continue
        
        # Create new car
        image_urls = car_data.pop("image_urls", [])
        source_url = car_data.pop("source_url", "")
        
        car = await sync_to_async(Car.objects.create)(
            seller=user,
            **car_data
        )
        
        # Download and create car images
        for i, img_url in enumerate(image_urls):
            try:
                image_file = await download_image(img_url)
                if image_file:
                    await sync_to_async(CarImage.objects.create)(
                        car=car,
                        image=image_file,
                        is_primary=(i == 0)
                    )
            except Exception as e:
                print(f"Error saving image {img_url}: {e}")
        
        imported_count += 1
        print(f"[✓] Imported: {car_data['make']} {car_data['model']} ({car_data['year']}) | ${car_data['price']}")
    
    return imported_count

def import_cars_sync(limit=20, admin_user_id=1):
    """Synchronous wrapper for import_cars_from_autoria"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(import_cars_from_autoria(limit, admin_user_id))
    loop.close()
    return result

# Command-line interface for testing
if __name__ == "__main__":
    import sys
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    admin_id = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    print(f"Importing up to {limit} cars...")
    count = import_cars_from_autoria(limit=limit, admin_user_id=admin_id)
    print(f"Successfully imported {count} cars")
