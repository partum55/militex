import sqlite3

# Підключаємося до бази даних у поточній директорії
conn = sqlite3.connect("test_database.db")
cursor = conn.cursor()

# Отримуємо всі записи з таблиці users
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()

# Виводимо результати
for row in rows:
    print(row)

conn.close()