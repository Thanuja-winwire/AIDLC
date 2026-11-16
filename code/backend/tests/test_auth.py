def test_register_login_me(client):
    r = client.post("/auth/register", json={"email": "A@Example.com", "password": "Passw0rd!", "name": "A"})
    assert r.status_code == 201
    assert r.json()["user"]["email"] == "a@example.com"
    assert r.json()["user"]["role"] == "customer"
    tok = client.post("/auth/login", json={"email": "a@example.com", "password": "Passw0rd!"}).json()
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {tok['access_token']}"})
    assert me.status_code == 200 and me.json()["name"] == "A"


def test_duplicate_email_conflicts(client):
    body = {"email": "dup@example.com", "password": "Passw0rd!", "name": "D"}
    assert client.post("/auth/register", json=body).status_code == 201
    r = client.post("/auth/register", json={**body, "email": "DUP@example.com"})
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "email_taken"


def test_short_password_rejected(client):
    r = client.post("/auth/register", json={"email": "s@example.com", "password": "short", "name": "S"})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "validation_error"


def test_login_failure_is_generic(client, customer):
    wrong_pw = client.post("/auth/login", json={"email": "casey@example.com", "password": "nope-nope"})
    unknown = client.post("/auth/login", json={"email": "ghost@example.com", "password": "nope-nope"})
    assert wrong_pw.status_code == unknown.status_code == 401
    assert wrong_pw.json() == unknown.json()


def test_requires_token(client):
    assert client.get("/plans").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_admin_routes_forbidden_for_customer(client, customer, admin):
    assert client.get("/admin/analytics/summary", headers=customer).status_code == 403
    assert client.get("/admin/analytics/summary", headers=admin).status_code == 200


def test_plans_lists_seeded_active_only(client, customer, admin):
    plans = client.get("/plans", headers=customer).json()
    assert len(plans) == 4 and plans[0]["price"] == "9.99"
    client.post(f"/admin/plans/{plans[0]['id']}/deactivate", headers=admin)
    assert len(client.get("/plans", headers=customer).json()) == 3
