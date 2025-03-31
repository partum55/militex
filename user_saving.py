from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from werkzeug.security import generate_password_hash, check_password_hash


# 🔹 Налаштування підключення до PostgreSQL
DATABASE_URL = "sqlite:///./test_database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 🔹 Таблиця Email
class Email(Base):
    __tablename__ = "emails"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)

# 🔹 Таблиця Паролів
class Password(Base):
    __tablename__ = "passwords"
    id = Column(Integer, primary_key=True, index=True)
    password_hash = Column(String, nullable=False)

# 🔹 Основна Таблиця Користувачів
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)

    email_id = Column(Integer, ForeignKey("emails.id"))
    password_id = Column(Integer, ForeignKey("passwords.id"))

    email = relationship("Email")
    password = relationship("Password")

# 🔹 Функція створення нового користувача
def create_user(db: Session, username: str, email: str, password: str):
    """Створює нового користувача, якщо такого ще немає."""
    existing_email = db.query(Email).filter(Email.email == email).first()
    if existing_email:
        return {"error": "Email уже зайнятий"}

    # Створення email та пароля
    email_entry = Email(email=email)
    password_entry = Password(password_hash=generate_password_hash(password))
    
    db.add(email_entry)
    db.add(password_entry)
    db.commit()
    db.refresh(email_entry)
    db.refresh(password_entry)

    # Створення користувача
    new_user = User(username=username, email_id=email_entry.id, password_id=password_entry.id)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"id": new_user.id, "username": new_user.username, "email": email_entry.email}

# 🔹 Функція перевірки існування користувача
def user_exists(db: Session, email: str):
    """Перевіряє, чи існує користувач з таким email."""
    return db.query(User).join(Email).filter(Email.email == email).first() is not None

# 🔹 Функція перевірки пароля
def verify_password(db: Session, email: str, password: str):
    """Перевіряє пароль користувача."""
    user = db.query(User).join(Email).filter(Email.email == email).first()
    if not user:
        return {"error": "Користувача не знайдено"}

    password_entry = db.query(Password).filter(Password.id == user.password_id).first()
    if check_password_hash(password_entry.password_hash, password):
        return {"message": "Авторизація успішна", "user_id": user.id}
    
    return {"error": "Невірний пароль"}

# 🔹 Видалення користувача
def delete_user(db: Session, user_id: int):
    """Видаляє користувача за ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.query(Email).filter(Email.id == user.email_id).delete()
        db.query(Password).filter(Password.id == user.password_id).delete()
        db.delete(user)
        db.commit()
        return {"message": f"Користувач {user.username} видалений"}
    return {"error": "Користувача не знайдено"}

# 🔹 Створення таблиць
Base.metadata.create_all(bind=engine)

# 🔹 Отримання сесії БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔹 Тестування функцій
if __name__ == "__main__":
    db = next(get_db())

    # ✅ Реєстрація користувача
    response = create_user(db, "JohnDoe", "john@example.com", "securepassword")
    print(response)

    # ✅ Перевірка існування користувача
    exists = user_exists(db, "john@example.com")
    print(f"Користувач існує? {exists}")

    # ✅ Авторизація користувача
    auth_response = verify_password(db, "john@example.com", "securepassword")
    print(auth_response)

    # ❌ Спроба входу з неправильним паролем
    auth_response_fail = verify_password(db, "john@example.com", "wrongpassword")
    print(auth_response_fail)

    # 🗑 Видалення користувача
    delete_response = delete_user(db, response["id"])
    print(delete_response)