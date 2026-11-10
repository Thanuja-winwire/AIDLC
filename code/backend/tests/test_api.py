ADDR = {"full_name": "Jo Doe", "line1": "1 Main St", "city": "Austin", "state": "TX", "postal_code": "78701", "country": "USA"}


def card(n="4242424242424242"):
    return {"number": n, "expiry": "12/99", "cvc": "123"}


def test_register_login_and_duplicate(client):
    r = client.post("/api/v1/auth/register", json={"email": "A@x.com", "password": "Passw0rdx", "name": "A"})
    assert r.status_code == 201 and r.json()["user"]["role"] == "customer"
    assert client.post("/api/v1/auth/register", json={"email": "a@x.com", "password": "Passw0rdx", "name": "A"}).status_code == 409
    assert client.post("/api/v1/auth/login", json={"email": "a@x.com", "password": "bad"}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": "a@x.com", "password": "Passw0rdx"}).status_code == 200


def test_weak_password_rejected(client):
    r = client.post("/api/v1/auth/register", json={"email": "b@x.com", "password": "short", "name": "B"})
    assert r.status_code == 422


def test_me_requires_auth(client, user_h):
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers=user_h).json()["email"] == "user@example.com"


def test_catalog_search_filters(client):
    r = client.get("/api/v1/products", params={"q": "novel"}).json()
    assert r["total"] == 1
    assert client.get("/api/v1/products", params={"in_stock": True}).json()["total"] == 1
    assert client.get("/api/v1/products", params={"min_price": 20}).json()["total"] == 1
    assert client.get("/api/v1/products", params={"min_price": 20, "max_price": 5}).status_code == 422


def test_cart_stock_limit(client, user_h):
    assert client.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 2}, headers=user_h).status_code == 200
    assert client.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 4}, headers=user_h).status_code == 409
    cart = client.get("/api/v1/cart", headers=user_h).json()
    assert cart["subtotal"] == "20.00" and cart["tax"] == "1.60" and cart["total"] == "21.60"


def test_checkout_success_decrements_stock_and_clears_cart(client, user_h):
    client.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 2}, headers=user_h)
    r = client.post("/api/v1/orders", json={"address": ADDR, "card": card()}, headers=user_h)
    assert r.status_code == 201 and r.json()["payment_success"] is True
    assert r.json()["order"]["status"] == "paid"
    assert client.get("/api/v1/products/1").json()["stock"] == 3
    assert client.get("/api/v1/cart", headers=user_h).json()["items"] == []


def test_declined_then_retry_and_cancel_restores_stock(client, user_h):
    client.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 1}, headers=user_h)
    r = client.post("/api/v1/orders", json={"address": ADDR, "card": card("4000000000000002")}, headers=user_h).json()
    oid = r["order"]["id"]
    assert r["order"]["status"] == "payment_failed"
    ok = client.post(f"/api/v1/orders/{oid}/pay", json={"card": card()}, headers=user_h).json()
    assert ok["order"]["status"] == "paid"
    c = client.post(f"/api/v1/orders/{oid}/cancel", headers=user_h).json()
    assert c["status"] == "cancelled" and c["payments"][-1]["status"] == "refunded"
    assert client.get("/api/v1/products/1").json()["stock"] == 5


def test_empty_cart_checkout_rejected(client, user_h):
    assert client.post("/api/v1/orders", json={"address": ADDR, "card": card()}, headers=user_h).status_code == 409


def test_orders_isolated_between_users(client, user_h):
    client.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 1}, headers=user_h)
    oid = client.post("/api/v1/orders", json={"address": ADDR, "card": card()}, headers=user_h).json()["order"]["id"]
    other = {"Authorization": "Bearer " + client.post("/api/v1/auth/register", json={"email": "o@x.com", "password": "Passw0rdx", "name": "O"}).json()["access_token"]}
    assert client.get(f"/api/v1/orders/{oid}", headers=other).status_code == 404


def test_admin_forbidden_for_customer(client, user_h):
    assert client.get("/api/v1/admin/metrics", headers=user_h).status_code == 403


def test_admin_product_crud_and_soft_delete(client, admin_h):
    body = {"name": "New", "description": "d", "price": "5.00", "stock": 3, "image_url": "", "category_id": 1}
    pid = client.post("/api/v1/admin/products", json=body, headers=admin_h).json()["id"]
    assert client.delete(f"/api/v1/admin/products/{pid}", headers=admin_h).status_code == 204
    assert client.get(f"/api/v1/products/{pid}").status_code == 404
    assert client.post("/api/v1/admin/products", json={**body, "price": "-1"}, headers=admin_h).status_code == 422


def test_admin_order_status_forward_only(client, user_h, admin_h):
    client.post("/api/v1/cart/items", json={"product_id": 1, "quantity": 1}, headers=user_h)
    oid = client.post("/api/v1/orders", json={"address": ADDR, "card": card()}, headers=user_h).json()["order"]["id"]
    url = f"/api/v1/admin/orders/{oid}/status"
    assert client.put(url, json={"status": "shipped"}, headers=admin_h).status_code == 409
    assert client.put(url, json={"status": "processing"}, headers=admin_h).json()["status"] == "processing"
    m = client.get("/api/v1/admin/metrics", headers=admin_h).json()
    assert m["total_orders"] == 1 and m["revenue"] == "10.80"


def test_admin_user_management(client, user_h, admin_h):
    users = client.get("/api/v1/admin/users", headers=admin_h).json()["items"]
    uid = next(u["id"] for u in users if u["email"] == "user@example.com")
    assert client.put(f"/api/v1/admin/users/{uid}", json={"is_active": False}, headers=admin_h).json()["is_active"] is False
    assert client.get("/api/v1/auth/me", headers=user_h).status_code == 401
