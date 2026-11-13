import pytest

from app.models.catalog import Product
from app.models.inventory import Location, MovementType
from app.models.user import Role
from app.services.stock_ledger import StockLedger


@pytest.fixture()
def world(db_session, auth_headers):
    p1 = Product(sku="A", name="Alpha", unit_cost=2, sale_price=5, reorder_level=1)
    p2 = Product(sku="B", name="Beta", unit_cost=3, sale_price=6, reorder_level=1)
    loc = Location(code="MAIN", name="Main")
    db_session.add_all([p1, p2, loc])
    db_session.commit()
    ledger = StockLedger(db_session, None)
    ledger.apply(product_id=p1.id, location_id=loc.id, delta=10, movement_type=MovementType.ADJUSTMENT)
    ledger.apply(product_id=p2.id, location_id=loc.id, delta=2, movement_type=MovementType.ADJUSTMENT)
    db_session.commit()
    return {"h": auth_headers(Role.STAFF), "p1": p1, "p2": p2, "loc": loc}


def test_sale_defaults_price_snapshots_cost_and_reduces_stock(client, world):
    body = {"location_id": world["loc"].id, "lines": [{"product_id": world["p1"].id, "quantity": 3}]}
    res = client.post("/api/sales", json=body, headers=world["h"])
    assert res.status_code == 201, res.text
    sale = res.json()
    assert sale["number"].startswith("SO-") and float(sale["total_amount"]) == 15.0
    stock = client.get("/api/stock", params={"product_id": world["p1"].id}, headers=world["h"]).json()
    assert stock["items"][0]["quantity"] == 7


def test_price_override(client, world):
    body = {"location_id": world["loc"].id, "lines": [{"product_id": world["p1"].id, "quantity": 2, "unit_price": "4.50"}]}
    assert float(client.post("/api/sales", json=body, headers=world["h"]).json()["total_amount"]) == 9.0


def test_insufficient_stock_rejects_whole_sale_naming_products(client, world):
    body = {
        "location_id": world["loc"].id,
        "lines": [{"product_id": world["p1"].id, "quantity": 1}, {"product_id": world["p2"].id, "quantity": 5}],
    }
    res = client.post("/api/sales", json=body, headers=world["h"])
    assert res.status_code == 409 and "B" in res.json()["detail"]
    stock = client.get("/api/stock", params={"product_id": world["p1"].id}, headers=world["h"]).json()
    assert stock["items"][0]["quantity"] == 10
    assert client.get("/api/sales", headers=world["h"]).json()["total"] == 0


def test_duplicate_lines_and_inactive_product(client, world, db_session):
    dup = {"location_id": world["loc"].id, "lines": [{"product_id": world["p1"].id, "quantity": 1}] * 2}
    assert client.post("/api/sales", json=dup, headers=world["h"]).status_code == 422
    world["p1"].is_active = False
    db_session.commit()
    one = {"location_id": world["loc"].id, "lines": [{"product_id": world["p1"].id, "quantity": 1}]}
    assert client.post("/api/sales", json=one, headers=world["h"]).status_code == 409


def test_get_sale_and_not_found(client, world):
    body = {"location_id": world["loc"].id, "lines": [{"product_id": world["p1"].id, "quantity": 1}]}
    sid = client.post("/api/sales", json=body, headers=world["h"]).json()["id"]
    assert client.get(f"/api/sales/{sid}", headers=world["h"]).status_code == 200
    assert client.get("/api/sales/9999", headers=world["h"]).status_code == 404
