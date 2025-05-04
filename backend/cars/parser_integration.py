from django.conf import settings
import requests
from bs4 import BeautifulSoup
import re
import os
from urllib.parse import urlparse
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.db import transaction
import random
import time
import datetime
from django.core.files.temp import NamedTemporaryFile

from .models import Car, CarImage

User = get_user_model()

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
BASE_URL = 'https://auto.ria.com/uk/search/?indexName=auto&body.id[0]=5&category_id=1&page=1'

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (X11; Linux x86_64)",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)",
]

def get_suv_links(limit=100):
    """Get links to SUV car listings from auto.ria.com with random delays and headers"""
    links = []
    page = 1

    while len(links) < limit:
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
        }
        url = BASE_URL.replace('page=1', f'page={page}')
        print(f"[PAGE {page}] Fetching: {url}")

        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"→ Status code: {response.status_code}")
            response.raise_for_status()
        except Exception as e:
            print(f"❌ Request failed on page {page}: {e}")
            break

        soup = BeautifulSoup(response.text, 'html.parser')
        page_links = []

        for a in soup.select('a.address[href]'):
            href = a['href']
            if href.startswith('https://auto.ria.com') and href not in links:
                page_links.append(href)
                links.append(href)
                if len(links) >= limit:
                    break

        print(f"✅ Found {len(page_links)} new links on page {page} (total: {len(links)})")

        page += 1

        # Random sleep between 0.5 and 2 seconds to avoid rate limiting
        delay = round(random.uniform(0.5, 2.0), 2)
        print(f"⏳ Sleeping for {delay}s")
        time.sleep(delay)

    print(f"🏁 Finished collecting {len(links)} links.")
    return links[:limit]

def extract_from_labels(soup, label_name):
    """Extract information from labeled technical specifications with improved pattern matching"""
    blocks = soup.select("div.technical-info span.label")
    for label in blocks:
        if label_name.lower() in label.get_text(strip=True).lower():
            argument = label.find_next_sibling("span", class_="argument")
            if argument:
                return argument.get_text(strip=True)
    
    # Try alternative methods if the first approach didn't work
    alt_selectors = [
        f"span.label:contains('{label_name}')",
        f"td.label:contains('{label_name}')",
        f"div.car-characteristics span.label:contains('{label_name}')"
    ]
    
    for selector in alt_selectors:
        try:
            label = soup.select_one(selector)
            if label:
                value = label.find_next_sibling(["span", "td", "div"])
                if value:
                    return value.get_text(strip=True)
        except Exception:
            continue
            
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

def extract_image_urls(soup, limit=10):
    """Extract car image URLs from the page with improved selectors"""
    image_urls = []
    
    # Try multiple image selector patterns
    selectors = [
        'div.gallery-order img.outline',
        'div.photo-620x465 img',
        'div.gallery-img img',
        'div.preview-gallery img',
        'div.carousel-inner img',
        '.gallery-order source',  # For picture elements
        '.carousel img[src]',
        'div.carousel-inner source[srcset]'  # For responsive images
    ]
    
    # Try each selector
    for selector in selectors:
        image_tags = soup.select(selector)
        if image_tags:
            for img in image_tags[:limit]:
                src = img.get('src') or img.get('data-src') or img.get('srcset') or img.get('data-lazy')
                if src and not src.endswith('no_photo.png'):
                    # Convert to full-size image URL if needed
                    if 'auto.ria.com' in src and 'small' in src:
                        src = src.replace('small', 'big')
                    if src not in image_urls:  # Avoid duplicates
                        image_urls.append(src)
    
    # If no images found, try alternative approach
    if not image_urls:
        print("No images found with standard selectors, trying alternative methods")
        # Try to find any img tags with src or data- attributes that might be car images
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and 'auto.ria.com' in src and not src.endswith('no_photo.png'):
                if src not in image_urls:
                    image_urls.append(src)
    
    # Clean up URLs (remove query parameters etc.)
    cleaned_urls = []
    for url in image_urls:
        if '?' in url:
            url = url.split('?')[0]
        cleaned_urls.append(url)
    
    print(f"Found {len(cleaned_urls)} images for the car")
    return cleaned_urls

def extract_price(soup):
    """Extract price from the page with better handling of different formats"""
    # Try multiple price selector patterns
    price_selectors = [
        "div.price_value", 
        "strong.bold.green.size22", 
        "span.price", 
        "div.price-seller", 
        "div.price-value",
    ]
    
    price = 0.0
    
    for selector in price_selectors:
        price_tag = soup.select_one(selector)
        if price_tag:
            price_text = price_tag.get_text(strip=True)
            try:
                # Try to extract numeric price value
                price_match = re.search(r"[\d\s,.]+", price_text)
                if price_match:
                    price_str = price_match.group(0).replace(" ", "").replace(",", ".")
                    try:
                        price = float(price_str)
                        # If price is in euros or another currency, convert approximately to USD
                        if '€' in price_text:
                            price *= 1.1  # Approximate EUR to USD conversion
                        break  # Stop if we found a valid price
                    except ValueError:
                        continue  # Try next selector if conversion failed
            except Exception:
                pass
    
    # If price is still 0, try looking for price in the whole page
    if price <= 0:
        try:
            # Find any text that looks like a price
            for element in soup.find_all(['span', 'div', 'strong', 'p']):
                text = element.get_text(strip=True)
                if "$" in text or "€" in text or "грн" in text:
                    price_match = re.search(r"[\d\s,.]+", text)
                    if price_match:
                        price_str = price_match.group(0).replace(" ", "").replace(",", ".")
                        try:
                            price = float(price_str)
                            if '€' in text:
                                price *= 1.1  # Approximate EUR to USD conversion
                            break
                        except ValueError:
                            continue
        except Exception:
            pass
    
    print(f"Extracted price: {price}")
    return price

def parse_car_details(url):
    """Parse car details from auto.ria.com listing"""
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()  # Raise exception for HTTP errors
        soup = BeautifulSoup(r.text, "html.parser")

        # Title extraction with better error handling
        title = soup.select_one("h1.head")
        if not title:
            print(f"Error: Could not find title element on page {url}")
            return None
        title_text = title.get_text(strip=True)

        # Extract year with better error handling
        year_match = re.search(r"\b(19|20)\d{2}\b", title_text)
        year = int(year_match.group(0)) if year_match else 2020
        if not year_match:
            print(f"Warning: Could not extract year from title '{title_text}', using default 2020")

        # Extract make and model with better validation
        title_parts = title_text.replace(str(year) if year_match else "", "").strip().split()
        car_make = title_parts[0] if len(title_parts) >= 1 else "Unknown"
        model = " ".join(title_parts[1:]) if len(title_parts) > 1 else "Unknown"
        if car_make == "Unknown" or model == "Unknown":
            print(f"Warning: Incomplete make/model extracted from '{title_text}'")

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
        # Add a backup method to extract fuel type from other locations
        if not fuel_type_raw:
            # Try alternative labels
            alt_labels = ["Паливо", "Тип палива", "Тип двигуна", "Топливо"]
            for label in alt_labels:
                fuel_type_raw = extract_from_labels(soup, label)
                if fuel_type_raw:
                    break
            
            # If still not found, try to find it in the page content
            if not fuel_type_raw:
                for elem in soup.select("div.car-characteristics, div.technical-info, div.all-parameters"):
                    text = elem.get_text().lower()
                    if 'бензин' in text:
                        fuel_type_raw = "бензин"
                        break
                    elif 'дизель' in text:
                        fuel_type_raw = "дизель"
                        break
                    elif 'газ' in text:
                        fuel_type_raw = "газ"
                        break
                    elif 'електро' in text or 'электро' in text:
                        fuel_type_raw = "електро"
                        break
                    elif 'гібрид' in text or 'гибрид' in text:
                        fuel_type_raw = "гібрид"
                        break

        fuel_type = "gasoline"  # Default value
        if fuel_type_raw:
            fuel_text = fuel_type_raw.lower()
            if 'дизель' in fuel_text or 'диз' in fuel_text:
                fuel_type = "diesel"
            elif 'електро' in fuel_text or 'электро' in fuel_text:
                fuel_type = "electric"
            elif 'гібрид' in fuel_text or 'гибрид' in fuel_text:
                fuel_type = "hybrid"
            elif 'газ' in fuel_text or 'метан' in fuel_text or 'пропан' in fuel_text:
                fuel_type = "gas"
            elif 'бензин' in fuel_text:
                fuel_type = "gasoline"

        # Print for debugging
        print(f"Extracted fuel type: '{fuel_type_raw}' → '{fuel_type}'")

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
        if price <= 0:
            print(f"Warning: Zero or negative price for {car_make} {model}, setting to 1000")
            price = 1000.0

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
            "original_url": url,
            "is_imported": True
        }
    except Exception as e:
        print(f"Error parsing car details from {url}: {e}")
        import traceback
        traceback.print_exc()
        return None

def download_image(url):
    """Download image from URL and create a ContentFile"""
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Get file extension from URL
        parsed_url = urlparse(url)
        path = parsed_url.path
        ext = os.path.splitext(path)[1].lower()
        if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            ext = '.jpg'  # Default to .jpg if no extension is found
        
        # Create a unique filename
        from django.utils import timezone
        filename = f"{timezone.now().strftime('%Y%m%d%H%M%S')}{ext}"
        
        # Create a ContentFile with the image data
        content_file = ContentFile(response.content, name=filename)
        return content_file
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

@transaction.atomic
def import_cars_sync(limit=100, admin_user_id=1):
    """Import cars from auto.ria.com and save to the PostgreSQL database"""
    try:
        print(f"Starting import_cars_sync with limit={limit}, admin_user_id={admin_user_id}")
        
        # Check if admin user exists
        try:
            admin_user = User.objects.get(id=admin_user_id)
            print(f"Using admin user: {admin_user.username} (ID: {admin_user.id})")
        except User.DoesNotExist:
            print(f"Admin user with ID {admin_user_id} not found, creating default admin")
            admin_user = User.objects.filter(is_superuser=True).first()
            
            if not admin_user:
                admin_user = User.objects.create_superuser(
                    'admin', 'admin@example.com', 'admin123'
                )
            admin_user_id = admin_user.id
            print(f"Created or found admin user with ID: {admin_user_id}")
        
        # # Check if we already have cars
        # existing_count = Car.objects.count()
        # if existing_count > 0:
        #     print(f"Database already has {existing_count} cars")
        #     limit = min(limit, max(20, 100 - existing_count))  # Adjust limit based on existing cars
        #     if limit <= 0:
        #         print("Already have enough cars, skipping import")
        #         return 0
        #     print(f"Will import up to {limit} more cars")
        print('Delete all cars')
        Car.objects.all().delete()  # Delete all cars for testing purposes
        print('All cars deleted')
        # Get the car links
        links = get_suv_links(limit=limit)
        imported_count = 0
        
        # Process each car
        for link in links:
            car_data = parse_car_details(link)
            if not car_data:
                continue
                
            # # Check if car with same make, model and year already exists
            # existing_car = Car.objects.filter(
            #     make=car_data["make"],
            #     model=car_data["model"],
            #     year=car_data["year"],
            #     mileage=car_data["mileage"]
            # ).first()
            
            # if existing_car:
            #     print(f"[SKIP] Car already exists: {car_data['make']} {car_data['model']} ({car_data['year']})")
            #     continue
            
            # Extract image URLs
            image_urls = car_data.pop("image_urls", [])
            
            # Create car
            car = Car.objects.create(
                seller=admin_user,
                **car_data
            )
            
            # Process images
            for i, img_url in enumerate(image_urls):
                try:
                    # Download and create image
                    img_content = download_image(img_url)
                    if img_content:
                        CarImage.objects.create(
                            car=car,
                            image=img_content,
                            is_primary=(i == 0)  # First image is primary
                        )
                except Exception as e:
                    print(f"Error processing image {img_url}: {e}")
            
            imported_count += 1
            print(f"[✓] Imported: {car_data['make']} {car_data['model']} ({car_data['year']}) | ${car_data['price']}")
        
        return imported_count
    except Exception as e:
        print(f"Error during import: {e}")
        import traceback
        traceback.print_exc()
        return 0