import os
import sys
from decimal import Decimal
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET"] = "test-secret"
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import pytest  # noqa: E402

from app import models  # noqa: E402
from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.services import cart_service, order_service  # noqa: E402

ADDRESS = {
    "full_name": "Jane Doe", "line1": "1 Main St", "city": "Springfield", "state": "IL",
    "postal_code": "62701", "country": "US", "phone": "5551234567",
}
GOOD_CARD = "4242424242424242"
DECLINE_CARD = "4000000000000002"


@pytest.fixture()
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        yield session
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def make_user(db):
    def _make(email="a@example.com", role="customer"):
        u = models.User(email=email, password_hash="x", name="U", role=role)
        db.add(u)
        db.commit()
        return u
    return _make


@pytest.fixture()
def user(make_user):
    return make_user()


@pytest.fixture()
def make_product(db):
    state = {}

    def _make(name="Novel", price="10.00", stock=10, active=True):
        if "cat" not in state:
            cat = models.Category(name="Books", slug="books")
            db.add(cat)
            db.commit()
            state["cat"] = cat
        p = models.Product(name=name, description="d", price=Decimal(price), stock=stock,
                           category_id=state["cat"].id, is_active=active)
        db.add(p)
        db.commit()
        return p
    return _make


@pytest.fixture()
def make_order(db, make_product):
    def _make(user, qty=1, stock=10, product=None):
        product = product or make_product(name=f"P{user.id}-{qty}-{db.query(models.Order).count()}", stock=stock)
        cart_service.add_item(db, user, product.id, qty)
        return order_service.place_order(db, user, ADDRESS)
    return _make
