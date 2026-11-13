import os

# Must be set before the app modules read settings.
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("JWT_SECRET", "test-secret")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine

from app.core.db import Base, get_db
from app.core.security import hash_password
import app.models  # noqa: F401
from app.models.user import Role, User


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )

    @event.listens_for(engine, "connect")
    def _fk(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = Session()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture()
def make_user(db_session):
    def _make(email="user@example.com", role=Role.STAFF, password="Passw0rd!", active=True):
        user = User(
            email=email, full_name=email.split("@")[0].title(), password_hash=hash_password(password),
            role=role, is_active=active,
        )
        db_session.add(user)
        db_session.commit()
        return user

    return _make


@pytest.fixture()
def client(db_session):
    from app.main import app

    def _override():
        try:
            yield db_session
            db_session.commit()
        except Exception:
            db_session.rollback()
            raise

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client, make_user):
    """Returns a function that creates a user and returns bearer headers for it."""

    def _headers(role=Role.ADMIN, email=None, password="Passw0rd!"):
        email = email or f"{role.value.lower()}@example.com"
        make_user(email=email, role=role, password=password)
        res = client.post("/api/auth/login", json={"email": email, "password": password})
        assert res.status_code == 200, res.text
        return {"Authorization": f"Bearer {res.json()['access_token']}"}

    return _headers
