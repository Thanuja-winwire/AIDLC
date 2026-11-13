import pytest

from app.models.catalog import Product
from app.models.inventory import Location, MovementType
from app.models.user import Role
from app.services.stock_ledger import StockLedger


@pytest.fixture()
def world(db_session, auth_headers):
    p = Product(sku="A", name="Alpha", unit_cost=2, sale_price=5, reorder_level=1)
    a, b = Location(code="A", name="Loc A"), Location(code="B", name="Loc B")
    db_session.add_all([p, a, b])
    db_session.commit()
    StockLedger(db_session, None).apply(
        product_id=p.id, location_id=a.id, delta=10, movement_type=MovementType.ADJUSTMENT
    )
    db_session.commit()
    return {"h": auth_headers(Role.STAFF), "p": p, "a": a, "b": b}


def qty(client, w, loc):
    items = client.get("/api/stock", params={"location_id": loc.id}, headers=w["h"]).json()["items"]
    return items[0]["quantity"] if items else 0


def test_transfer_moves_stock_atomically(client, world):
    body = {"product_id": world["p"].id, "from_location_id": world["a"].id, "to_location_id": world["b"].id, "quantity": 4}
    res = client.post("/api/transfers", json=body, headers=world["h"])
    assert res.status_code == 201 and res.json()["number"].startswith("TR-")
    assert qty(client, world, world["a"]) == 6 and qty(client, world, world["b"]) == 4
    moves = client.get("/api/stock/movements", params={"product_id": world["p"].id}, headers=world["h"]).json()
    types = {m["type"] for m in moves["items"]}
    assert {"TRANSFER_OUT", "TRANSFER_IN"} <= types


def test_transfer_insufficient_and_same_location(client, world):
    body = {"product_id": world["p"].id, "from_location_id": world["a"].id, "to_location_id": world["b"].id, "quantity": 11}
    assert client.post("/api/transfers", json=body, headers=world["h"]).status_code == 409
    assert qty(client, world, world["a"]) == 10 and qty(client, world, world["b"]) == 0
    same = {**body, "to_location_id": world["a"].id, "quantity": 1}
    assert client.post("/api/transfers", json=same, headers=world["h"]).status_code == 422


def test_adjustment_delta_and_below_zero(client, world):
    base = {"product_id": world["p"].id, "location_id": world["a"].id, "mode": "DELTA", "reason": "DAMAGE"}
    assert client.post("/api/adjustments", json={**base, "delta": -3}, headers=world["h"]).status_code == 201
    assert qty(client, world, world["a"]) == 7
    assert client.post("/api/adjustments", json={**base, "delta": -8}, headers=world["h"]).status_code == 409
    assert client.post("/api/adjustments", json={**base, "delta": 0}, headers=world["h"]).status_code == 422


def test_adjustment_count_mode(client, world):
    base = {"product_id": world["p"].id, "location_id": world["a"].id, "mode": "COUNT", "reason": "RECOUNT"}
    res = client.post("/api/adjustments", json={**base, "counted_quantity": 7}, headers=world["h"])
    assert res.status_code == 201 and res.json()["delta"] == -3
    assert qty(client, world, world["a"]) == 7
    assert client.post("/api/adjustments", json={**base, "counted_quantity": 7}, headers=world["h"]).status_code == 422


def test_other_reason_requires_note(client, world):
    body = {"product_id": world["p"].id, "location_id": world["a"].id, "mode": "DELTA", "delta": 1, "reason": "OTHER"}
    assert client.post("/api/adjustments", json=body, headers=world["h"]).status_code == 422
    assert client.post("/api/adjustments", json={**body, "note": "found one"}, headers=world["h"]).status_code == 201
