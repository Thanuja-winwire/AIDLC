import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET"] = "test-secret"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app import models  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        cat = models.Category(name="Books", slug="books")
        db.add(cat)
        db.flush()
        db.add(models.Product(name="Novel", description="A story", price="10.00", stock=5, category_id=cat.id))
        db.add(models.Product(name="Gadget", description="Shiny", price="50.00", stock=0, category_id=cat.id))
        admin = models.User(email="admin@example.com", password_hash=hash_password("Admin1234"), name="Admin", role="admin")
        db.add(admin)
        db.flush()
        db.add(models.Cart(user_id=admin.id))
        db.commit()
    yield


@pytest.fixture()
def client():
    return TestClient(app)


def auth(client, email="user@example.com", password="Passw0rdx", name="User", register=True):
    if register:
        r = client.post("/api/v1/auth/register", json={"email": email, "password": password, "name": name})
        assert r.status_code == 201, r.text
        token = r.json()["access_token"]
    else:
        token = client.post("/api/v1/auth/login", json={"email": email, "password": password}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def user_h(client):
    return auth(client)


@pytest.fixture()
def admin_h(client):
    return auth(client, "admin@example.com", "Admin1234", register=False)
