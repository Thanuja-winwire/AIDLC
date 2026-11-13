import pytest

from app.models.catalog import Product
from app.models.inventory import Location
from app.models.supplier import Supplier
from app.models.user import Role


@pytest.fixture()
def world(db_session, auth_headers):
    p1 = Product(sku="A", name="Alpha", unit_cost=2, sale_price=5, reorder_level=1)
    p2 = Product(sku="B", name="Beta", unit_cost=3, sale_price=6, reorder_level=1)
    loc = Location(code="MAIN", name="Main")
    sup = Supplier(name="Acme")
    db_session.add_all([p1, p2, loc, sup])
    db_session.commit()
    return {"admin": auth_headers(Role.ADMIN), "staff": auth_headers(Role.STAFF), "p1": p1, "p2": p2, "loc": loc, "sup": sup}


def create_po(client, w, qty1=10, qty2=5):
    body = {
        "supplier_id": w["sup"].id, "destination_location_id": w["loc"].id,
        "lines": [{"product_id": w["p1"].id, "quantity_ordered": qty1}, {"product_id": w["p2"].id, "quantity_ordered": qty2}],
    }
    res = client.post("/api/purchase-orders", json=body, headers=w["admin"])
    assert res.status_code == 201, res.text
    return res.json()


def stock(client, w, product):
    res = client.get("/api/stock", params={"product_id": product.id}, headers=w["admin"]).json()
    return res["items"][0]["quantity"] if res["items"] else 0


def test_create_defaults_cost_and_number(client, world):
    po = create_po(client, world)
    assert po["status"] == "DRAFT" and po["number"].startswith("PO-")
    assert float(po["lines"][0]["unit_cost"]) == 2.0 and float(po["total_amount"]) == 35.0


def test_staff_cannot_create_approve_cancel(client, world):
    po = create_po(client, world)
    assert client.post("/api/purchase-orders", json={}, headers=world["staff"]).status_code == 403
    assert client.post(f"/api/purchase-orders/{po['id']}/approve", headers=world["staff"]).status_code == 403
    assert client.post(f"/api/purchase-orders/{po['id']}/cancel", headers=world["staff"]).status_code == 403


def test_duplicate_product_rejected(client, world):
    body = {
        "supplier_id": world["sup"].id, "destination_location_id": world["loc"].id,
        "lines": [{"product_id": world["p1"].id, "quantity_ordered": 1}] * 2,
    }
    assert client.post("/api/purchase-orders", json=body, headers=world["admin"]).status_code == 422


def test_cannot_receive_draft(client, world):
    po = create_po(client, world)
    body = {"lines": [{"po_line_id": po["lines"][0]["id"], "quantity": 1}]}
    assert client.post(f"/api/purchase-orders/{po['id']}/receive", json=body, headers=world["staff"]).status_code == 409


def test_partial_then_full_receipt_updates_stock_and_status(client, world):
    po = create_po(client, world)
    pid = po["id"]
    assert client.post(f"/api/purchase-orders/{pid}/approve", headers=world["admin"]).json()["status"] == "APPROVED"
    l1, l2 = po["lines"]
    r1 = client.post(f"/api/purchase-orders/{pid}/receive", json={"lines": [{"po_line_id": l1["id"], "quantity": 4}]}, headers=world["staff"])
    assert r1.status_code == 200 and r1.json()["status"] == "PARTIALLY_RECEIVED"
    assert stock(client, world, world["p1"]) == 4
    r2 = client.post(
        f"/api/purchase-orders/{pid}/receive",
        json={"lines": [{"po_line_id": l1["id"], "quantity": 6}, {"po_line_id": l2["id"], "quantity": 5}]},
        headers=world["staff"],
    )
    assert r2.json()["status"] == "RECEIVED"
    assert stock(client, world, world["p1"]) == 10 and stock(client, world, world["p2"]) == 5


def test_over_receipt_rejected(client, world):
    po = create_po(client, world)
    client.post(f"/api/purchase-orders/{po['id']}/approve", headers=world["admin"])
    body = {"lines": [{"po_line_id": po["lines"][0]["id"], "quantity": 11}]}
    assert client.post(f"/api/purchase-orders/{po['id']}/receive", json=body, headers=world["staff"]).status_code == 409
    assert stock(client, world, world["p1"]) == 0


def test_cancel_after_partial_keeps_stock_and_received_cannot_cancel(client, world):
    po = create_po(client, world)
    pid = po["id"]
    client.post(f"/api/purchase-orders/{pid}/approve", headers=world["admin"])
    client.post(f"/api/purchase-orders/{pid}/receive", json={"lines": [{"po_line_id": po["lines"][0]["id"], "quantity": 3}]}, headers=world["staff"])
    res = client.post(f"/api/purchase-orders/{pid}/cancel", headers=world["admin"])
    assert res.json()["status"] == "CANCELLED" and stock(client, world, world["p1"]) == 3
    assert client.post(f"/api/purchase-orders/{pid}/cancel", headers=world["admin"]).status_code == 409


def test_edit_only_in_draft(client, world):
    po = create_po(client, world)
    ok = client.put(f"/api/purchase-orders/{po['id']}", json={"notes": "hi"}, headers=world["admin"])
    assert ok.status_code == 200 and ok.json()["notes"] == "hi"
    client.post(f"/api/purchase-orders/{po['id']}/approve", headers=world["admin"])
    assert client.put(f"/api/purchase-orders/{po['id']}", json={"notes": "x"}, headers=world["admin"]).status_code == 409
