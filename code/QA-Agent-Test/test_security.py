from datetime import datetime, timedelta, timezone

import jwt

from app.core import security
from app.core.config import settings


def test_utc_01_password_hash_round_trip():
    h = security.hash_password("Passw0rdX")
    assert security.verify_password("Passw0rdX", h) is True


def test_utc_02_wrong_password_rejected():
    h = security.hash_password("Passw0rdX")
    assert security.verify_password("Wrong123", h) is False


def test_utc_03_malformed_hash_returns_false():
    assert security.verify_password("Passw0rdX", "notahash") is False


def test_utc_04_token_encode_decode():
    payload = security.decode_token(security.create_access_token(1, "customer"))
    assert payload["sub"] == "1"
    assert payload["role"] == "customer"


def test_utc_05_invalid_token_returns_none():
    assert security.decode_token("abc.def.ghi") is None


def test_utc_06_expired_token_returns_none(monkeypatch):
    monkeypatch.setattr(settings, "jwt_expire_minutes", -5)
    token = security.create_access_token(1, "customer")
    assert security.decode_token(token) is None
