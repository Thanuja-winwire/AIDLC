import pytest
from fastapi.testclient import TestClient

from app import data_access
from app.main import app


@pytest.fixture
def db_path(tmp_path, monkeypatch):
    path = str(tmp_path / "test.db")
    monkeypatch.setenv("TASK_DB_PATH", path)
    data_access.init_db(path)
    return path


@pytest.fixture
def client(db_path):
    return TestClient(app)
