import requests
from time import sleep

headers = {
    "User-Agent": "Mozilla/5.0"
}

for i in range(1, 101):  # 100 запитів
    url = f'https://auto.ria.com/uk/search/?indexName=auto&category_id=1&page={i}'
    r = requests.get(url, headers=headers)
    print(f"[{i}] Status: {r.status_code}")
    if r.status_code == 429:
        print("⚠️ Отримано 429 Too Many Requests – досягнуто ліміту.")
        break
    sleep(0.5)  # уповільнюй, щоб не банили