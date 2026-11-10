"""Seed an admin user, categories and sample products. Idempotent.

Usage (from code/backend):  python seed.py
Also the recovery path if all admins are locked out (BR-M6).
"""
import os
from decimal import Decimal

from sqlalchemy import select

from app import models
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin1234")

CATEGORIES = {"Electronics": "electronics", "Books": "books", "Clothing": "clothing", "Home": "home"}
PRODUCTS = [
    ("Wireless Headphones", "Over-ear Bluetooth headphones with noise isolation.", "89.99", 25, "Electronics"),
    ("Mechanical Keyboard", "Tactile mechanical keyboard with RGB backlight.", "74.50", 12, "Electronics"),
    ("USB-C Charger 65W", "Fast GaN charger for laptops and phones.", "34.00", 40, "Electronics"),
    ("Smart Watch", "Fitness tracking and notifications.", "129.00", 4, "Electronics"),
    ("Python Crash Course", "Hands-on introduction to programming.", "29.95", 30, "Books"),
    ("Clean Architecture", "A craftsman's guide to software structure.", "35.00", 18, "Books"),
    ("Designing Data-Intensive Applications", "Principles behind reliable data systems.", "49.90", 9, "Books"),
    ("Cotton T-Shirt", "Soft everyday crew-neck tee.", "15.00", 100, "Clothing"),
    ("Denim Jacket", "Classic fit denim jacket.", "64.00", 15, "Clothing"),
    ("Running Shoes", "Lightweight breathable running shoes.", "79.99", 0, "Clothing"),
    ("Ceramic Mug Set", "Set of four 350ml mugs.", "24.00", 50, "Home"),
    ("LED Desk Lamp", "Dimmable lamp with USB charging port.", "27.50", 22, "Home"),
]


def run():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if not db.scalar(select(models.User).where(models.User.email == ADMIN_EMAIL)):
            db.add(models.User(email=ADMIN_EMAIL, password_hash=hash_password(ADMIN_PASSWORD), name="Admin", role="admin"))
            db.flush()
            admin = db.scalar(select(models.User).where(models.User.email == ADMIN_EMAIL))
            db.add(models.Cart(user_id=admin.id))
        cats = {}
        for name, slug in CATEGORIES.items():
            c = db.scalar(select(models.Category).where(models.Category.slug == slug))
            if not c:
                c = models.Category(name=name, slug=slug)
                db.add(c)
                db.flush()
            cats[name] = c
        for name, desc, price, stock, cat in PRODUCTS:
            if not db.scalar(select(models.Product).where(models.Product.name == name)):
                db.add(models.Product(name=name, description=desc, price=Decimal(price), stock=stock, category_id=cats[cat].id,
                                      image_url=""))
        db.commit()
    print(f"Seeded. Admin login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")


if __name__ == "__main__":
    run()
