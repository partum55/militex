import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
import requests
import tempfile
from cars.parser_integration import import_cars_sync

class Command(BaseCommand):
    help = 'Import cars from auto.ria.com'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Limit the number of cars to import'
        )
        parser.add_argument(
            '--user-id',
            type=int,
            default=1,
            help='User ID to use as the seller (default: 1)'
        )

    def setup_sqlite_db(self, db_path):
        """Setup SQLite database for temporary storage"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create tables if they don't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            year TEXT,
            fuel_type TEXT,
            body_type TEXT,
            mileage INTEGER,
            price REAL,
            description TEXT,
            condition TEXT,
            transmission TEXT,
            seller_id INTEGER
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sellers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_number TEXT,
            additional_info TEXT
        )
        ''')

        # Check if default seller exists
        cursor.execute("SELECT id FROM sellers WHERE name='AutoRia'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sellers (name, contact_number, additional_info) VALUES (?, ?, ?)",
                           ("AutoRia", "N/A", "Data from auto.ria.com"))

        conn.commit()
        conn.close()

    def parse_cars(self, limit=20):
        """Parse cars from auto.ria.com"""
        headers = {"User-Agent": "Mozilla/5.0"}
        base_url = 'https://auto.ria.com/uk/search/?indexName=auto&body.id[0]=5&category_id=1&page=1'

        cars_data = []

        try:
            # Get SUV links
            response = requests.get(base_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            links = []
            for a in soup.select('a.address[href]'):
                href = a['href']
                if href.startswith('https://auto.ria.com'):
                    links.append(href)
                if len(links) >= limit:
                    break

            # Parse each car
            for link in links:
                car_data = self.parse_car_details(link)
                if car_data:
                    cars_data.append(car_data)
                    self.stdout.write(f"Parsed: {car_data['name']} ({car_data['year']}) | {car_data['price']}$")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during parsing: {str(e)}"))

        return cars_data

    def parse_car_details(self, url):
        """Parse details from a single car page"""
        headers = {"User-Agent": "Mozilla/5.0"}

        try:
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

            description = self.extract_description(soup)

            fuel_type_raw = self.extract_from_labels(soup, "Двигун")
            fuel_type = "Невідомо"
            if fuel_type_raw and '•' in fuel_type_raw:
                fuel_type = fuel_type_raw.split('•')[-1].strip()
            elif fuel_type_raw:
                fuel_type = fuel_type_raw.strip().split()[-1] if self.extract_from_labels(soup,
                                                                                          "Двигун") != "Невідомо" else "Невідомо"

            transmission = self.extract_from_labels(soup, "коробка передач")

            # SUVs and crossovers
            body_type = "Позашляховик / Кросовер"

            condition_tag = soup.find("span", class_="label", string=re.compile("Технічний стан", re.IGNORECASE))
            if condition_tag:
                condition_span = condition_tag.find_next("span", class_="argument")
                condition = condition_span.get_text(strip=True) if condition_span else "Невідомо"
            else:
                condition = "Невідомо"

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

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error parsing car details from {url}: {str(e)}"))
            return None

    def extract_from_labels(self, soup, label_name):
        """Extract value from label in car details"""
        blocks = soup.select("div.technical-info span.label")
        for label in blocks:
            if label_name.lower() in label.get_text(strip=True).lower():
                argument = label.find_next_sibling("span", class_="argument")
                return argument.get_text(strip=True) if argument else "Невідомо"
        return "Невідомо"

    def extract_description(self, soup):
        """Extract car description"""
        desc_tag = soup.select_one("dd.additional-data.show-line")
        return desc_tag.get_text(strip=True) if desc_tag else "Опис відсутній"

    def save_to_sqlite(self, cars_data, db_path):
        """Save parsed data to SQLite database"""
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get seller id
        cursor.execute("SELECT id FROM sellers WHERE name='AutoRia'")
        seller_id = cursor.fetchone()[0]

        for car in cars_data:
            cursor.execute('''
            INSERT INTO cars (name, year, fuel_type, body_type, mileage, price, description, condition, transmission, seller_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                car['name'],
                car['year'],
                car['fuel_type'],
                car['body_type'],
                car['mileage'],
                car['price'],
                car['description'],
                car['condition'],
                car['transmission'],
                seller_id
            ))

        conn.commit()
        conn.close()

    def get_fuel_type_mapping(self, source_type):
        """Map fuel types from parser to Django model choices"""
        mapping = {
            'Бензин': 'gasoline',
            'Дизель': 'diesel',
            'Электро': 'electric',
            'Гибрид': 'hybrid',
            'Газ': 'gas',
            'Невідомо': 'gasoline',  # Default to gasoline
        }
        return mapping.get(source_type, 'gasoline')

    def get_body_type_mapping(self, source_type):
        """Map body types from parser to Django model choices"""
        mapping = {
            'Позашляховик / Кросовер': 'suv',
            'Седан': 'sedan',
            'Хетчбек': 'hatchback',
            'Универсал': 'estate',
            'Купе': 'coupe',
            'Пикап': 'pickup',
            'Невідомо': 'suv',  # Default to SUV
        }
        return mapping.get(source_type, 'suv')

    def get_transmission_mapping(self, source_type):
        """Map transmission types from parser to Django model choices"""
        mapping = {
            'Автомат': 'automatic',
            'Механика': 'manual',
            'Типтроник': 'semi-automatic',
            'Роботизированная': 'semi-automatic',
            'Невідомо': 'automatic',  # Default to automatic
        }
        return mapping.get(source_type, 'automatic')

    def get_condition_mapping(self, source_condition):
        """Map condition from parser to Django model choices"""
        if 'Гарний' in source_condition or 'Відмінний' in source_condition:
            return 'new'
        elif 'Потребує ремонту' in source_condition or 'Після ДТП' in source_condition:
            return 'damaged'
        else:
            return 'used'  # Default to used

    def import_cars_data(self, db_path):
        """Import data from SQLite to Django models"""
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get all cars from the parser database
        cursor.execute("SELECT * FROM cars")
        cars_data = cursor.fetchall()

        # Get or create a default admin user to be the seller
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )

        if created:
            admin_user.set_password('admin123')  # Set a default password
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user"))

        # Import each car to Django models
        counter = 0
        with transaction.atomic():
            for car_data in cars_data:
                # Extract data from parser record
                name_parts = car_data['name'].split()

                # Try to extract make and model
                if len(name_parts) >= 2:
                    make = name_parts[0]
                    model = ' '.join(name_parts[1:])
                else:
                    make = car_data['name']
                    model = 'Unknown'

                # Get or create car in Django database
                car, created = Car.objects.get_or_create(
                    make=make,
                    model=model,
                    defaults={
                        'year': int(car_data['year']) if car_data['year'].isdigit() else 2020,
                        'mileage': int(car_data['mileage']),
                        'vehicle_type': 'suv',  # Default SUV since most are SUVs
                        'condition': self.get_condition_mapping(car_data['condition']),
                        'fuel_type': self.get_fuel_type_mapping(car_data['fuel_type']),
                        'transmission': self.get_transmission_mapping(car_data['transmission']),
                        'body_type': self.get_body_type_mapping(car_data['body_type']),
                        'country': 'Ukraine',  # Default country
                        'city': 'Kyiv',  # Default city
                        'price': float(car_data['price']),
                        'negotiable': True,  # Default to negotiable
                        'description': car_data['description'],
                        'seller': admin_user,
                    }
                )

                if created:
                    counter += 1
                    self.stdout.write(f"Imported: {car.make} {car.model} ({car.year})")

        conn.close()
        return counter
