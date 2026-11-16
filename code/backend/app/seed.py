"""Idempotent seed: admin user and default plans. Run with `python -m app.seed`."""
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Plan, User

DEFAULT_PLANS = [
    ("Basic", "For individuals getting started", "9.99", "monthly", ["1 project", "Email support"]),
    ("Pro", "For growing teams", "19.99", "monthly", ["10 projects", "Priority support", "Analytics"]),
    ("Pro Yearly", "Pro, billed once a year", "199.00", "yearly", ["10 projects", "Priority support", "Analytics", "2 months free"]),
    ("Enterprise", "For organisations at scale", "49.99", "monthly", ["Unlimited projects", "Dedicated support", "SSO"]),
]


def seed(db: Session) -> None:
    admin_email = settings.admin_email.lower()
    if db.scalar(select(User).where(User.email == admin_email)) is None:
        db.add(
            User(
                email=admin_email,
                password_hash=hash_password(settings.admin_password),
                full_name="Administrator",
                role="admin",
            )
        )
    for name, description, price, interval, features in DEFAULT_PLANS:
        if db.scalar(select(Plan).where(Plan.name == name)) is None:
            db.add(
                Plan(name=name, description=description, price=Decimal(price), interval=interval, features=features)
            )
    db.commit()


if __name__ == "__main__":
    with SessionLocal() as session:
        seed(session)
    print("Seed complete")
