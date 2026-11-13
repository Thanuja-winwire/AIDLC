import pytest

from app.models.catalog import Product
from app.models.inventory import Location
from app.models.user import Role


@pytest.fixture()
def admin(auth_headers):
    return auth_headers(Role.ADMIN)


def make_product(client, admin, sku="SKU-1", **extra):
    body = {"sku": sku, "name": f"Product {sku}", "unit_cost": "5.00", "sale_price": "9.99", "reorder_level": 3, **extra}
    res = client.post("/api/products", json=body, headers=admin)
    assert res.status_code == 201, res.text
    return res.json()


def test_create_and_duplicate_sku_case_insensitive(client, admin):
    make_product(client, admin, "ABC-1")
    res = client.post("/api/products", json={"sku": " abc-1 ", "name": "Dup"}, headers=admin)
    assert res.status_code == 409


def test_negative_price_rejected(client, admin):
    res = client.post("/api/products", json={"sku": "N1", "name": "n", "sale_price": "-1"}, headers=admin)
    assert res.status_code == 422


def test_staff_read_only(client, admin, auth_headers):
    staff = auth_headers(Role.STAFF)
    make_product(client, admin)
    assert client.get("/api/products", headers=staff).status_code == 200
    assert client.post("/api/products", json={"sku": "S", "name": "s"}, headers=staff).status_code == 403


def test_search_and_pagination(client, admin):
    for i in range(3):
        make_product(client, admin, f"WID-{i}")
    make_product(client, admin, "GADGET")
    res = client.get("/api/products", params={"q": "wid", "size": 2}, headers=admin).json()
    assert res["total"] == 3 and len(res["items"]) == 2


def test_deactivate_and_update(client, admin):
    p = make_product(client, admin)
    res = client.patch(f"/api/products/{p['id']}", json={"is_active": False, "name": "Renamed"}, headers=admin)
    assert res.status_code == 200 and res.json()["is_active"] is False and res.json()["name"] == "Renamed"


def test_category_delete_blocked_when_in_use(client, admin):
    cat = client.post("/api/categories", json={"name": "Tools"}, headers=admin).json()
    make_product(client, admin, category_id=cat["id"])
    assert client.delete(f"/api/categories/{cat['id']}", headers=admin).status_code == 409
    empty = client.post("/api/categories", json={"name": "Empty"}, headers=admin).json()
    assert client.delete(f"/api/categories/{empty['id']}", headers=admin).status_code == 204


def test_suppliers_crud_and_staff_forbidden(client, admin, auth_headers):
    res = client.post("/api/suppliers", json={"name": "Acme", "email": "a@acme.com"}, headers=admin)
    assert res.status_code == 201
    sid = res.json()["id"]
    assert client.patch(f"/api/suppliers/{sid}", json={"phone": "123"}, headers=admin).json()["phone"] == "123"
    staff = auth_headers(Role.STAFF)
    assert client.post("/api/suppliers", json={"name": "X"}, headers=staff).status_code == 403
    assert client.get("/api/suppliers", headers=staff).json()["total"] == 1
    assert client.post("/api/suppliers", json={"name": "Bad", "email": "nope"}, headers=admin).status_code == 422
