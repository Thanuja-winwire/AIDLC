import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SCHEDULER_ENABLED"] = "false"
os.environ["JWT_SECRET"] = "test-secret"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402

GOOD_CARD = {"number": "4242424242424242", "expiry": "12/40", "cvc": "123"}
DECLINED_CARD = {"number": "4000000000000002", "expiry": "12/40", "cvc": "123"}


@pytest.fixture(autouse=True)
def _db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as s:
        seed(s)
    yield


@pytest.fixture
def db():
    with SessionLocal() as s:
        yield s


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def register(client):
    def _register(email="casey@example.com", password="Passw0rd!"):
        r = client.post("/auth/register", json={"email": email, "password": password, "name": "Casey"})
        assert r.status_code == 201, r.text
        r = client.post("/auth/login", json={"email": email, "password": password})
        assert r.status_code == 200, r.text
        return _headers(r.json()["access_token"])

    return _register


@pytest.fixture
def customer(register):
    return register()


@pytest.fixture
def admin(client):
    r = client.post("/auth/login", json={"email": "admin@example.com", "password": "Admin1234!"})
    assert r.status_code == 200, r.text
    return _headers(r.json()["access_token"])


@pytest.fixture
def plan_id(client, customer):
    def _find(name: str) -> int:
        plans = client.get("/plans", headers=customer).json()
        return next(p["id"] for p in plans if p["name"] == name)

    return _find
