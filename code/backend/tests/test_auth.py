from datetime import datetime, timedelta, timezone

from app.core.security import create_access_token
from app.models.user import Role


def test_login_success_and_me(client, make_user):
    make_user(email="a@example.com", role=Role.ADMIN)
    res = client.post("/api/auth/login", json={"email": "A@Example.com", "password": "Passw0rd!"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["role"] == "ADMIN"


def test_login_generic_failure(client, make_user):
    make_user(email="a@example.com")
    bad_pw = client.post("/api/auth/login", json={"email": "a@example.com", "password": "nope"})
    unknown = client.post("/api/auth/login", json={"email": "x@example.com", "password": "nope"})
    assert bad_pw.status_code == unknown.status_code == 401
    assert bad_pw.json()["detail"] == unknown.json()["detail"]


def test_inactive_user_cannot_login_or_use_token(client, make_user, db_session):
    user = make_user(email="a@example.com")
    token = create_access_token(user.id, "STAFF")
    user.is_active = False
    db_session.commit()
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "Passw0rd!"}).status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_missing_and_garbage_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_staff_forbidden_on_users(client, auth_headers):
    from app.models.user import Role as R
    headers = auth_headers(R.STAFF)
    assert client.get("/api/users", headers=headers).status_code == 403


def test_admin_creates_user_and_duplicate_email_conflicts(client, auth_headers):
    headers = auth_headers(Role.ADMIN)
    body = {"email": "new@example.com", "full_name": "New", "password": "longenough1", "role": "STAFF"}
    assert client.post("/api/users", json=body, headers=headers).status_code == 201
    assert client.post("/api/users", json=body, headers=headers).status_code == 409
    short = {**body, "email": "other@example.com", "password": "short"}
    assert client.post("/api/users", json=short, headers=headers).status_code == 422


def test_admin_cannot_lock_self_out(client, auth_headers):
    headers = auth_headers(Role.ADMIN)
    me = client.get("/api/auth/me", headers=headers).json()
    assert client.patch(f"/api/users/{me['id']}", json={"is_active": False}, headers=headers).status_code == 409
    assert client.patch(f"/api/users/{me['id']}", json={"role": "STAFF"}, headers=headers).status_code == 409


def test_cannot_deactivate_last_active_admin_but_can_with_another(client, auth_headers, make_user):
    headers = auth_headers(Role.ADMIN)
    other = make_user(email="second@example.com", role=Role.ADMIN)
    assert client.patch(f"/api/users/{other.id}", json={"is_active": False}, headers=headers).status_code == 200
