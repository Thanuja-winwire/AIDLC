from datetime import date

import pytest

from app.models.catalog import Product
from app.models.inventory import Location, MovementType
from app.models.user import Role
from app.services.stock_ledger import StockLedger


@pytest.fixture()
def world(db_session, auth_headers):
    p1 = Product(sku="A", name="Alpha", unit_cost=2, sale_price=5, reorder_level=5)
    p2 = Product(sku="B", name="Beta", unit_cost=3, sale_price=6, reorder_level=0)
    p3 = Product(sku="C", name="Gamma", unit_cost=1, sale_price=2, reorder_level=2)
    a, b = Location(code="A", name="Loc A"), Location(code="B", name="Loc B")
    db_session.add_all([p1, p2, p3, a, b])
    db_session.commit()
    ledger = StockLedger(db_session, None)
    ledger.apply(product_id=p1.id, location_id=a.id, delta=4, movement_type=MovementType.ADJUSTMENT)
    ledger.apply(product_id=p1.id, location_id=b.id, delta=3, movement_type=MovementType.ADJUSTMENT)
    ledger.apply(product_id=p2.id, location_id=a.id, delta=10, movement_type=MovementType.ADJUSTMENT)
    db_session.commit()
    return {"h": auth_headers(Role.STAFF), "p1": p1, "p2": p2, "p3": p3, "a": a, "b": b}


def test_total_view_uses_sum_across_locations(client, world):
    items = client.get("/api/alerts", params={"view": "total"}, headers=world["h"]).json()
    skus = {i["sku"]: i for i in items}
    # A: 4 + 3 = 7 > 5 so not low in total; B: 10 > 0 not low; C: no stock rows => 0 <= 2 low.
    assert set(skus) == {"C"} and skus["C"]["quantity"] == 0


def test_location_view_flags_each_location(client, world):
    items = client.get("/api/alerts", params={"view": "location"}, headers=world["h"]).json()
    pairs = {(i["sku"], i["location_name"]): i["quantity"] for i in items}
    assert pairs == {("A", "Loc A"): 4, ("A", "Loc B"): 3}


def test_invalid_view_rejected(client, world):
    assert client.get("/api/alerts", params={"view": "bogus"}, headers=world["h"]).status_code == 422


def test_dashboard_numbers(client, world):
    d = client.get("/api/dashboard", headers=world["h"]).json()
    assert d["total_products"] == 3 and d["total_units"] == 17
    assert float(d["stock_value"]) == 7 * 2 + 10 * 3
    assert d["low_stock_count"] == 1


def test_sales_report_margin_and_csv(client, world):
    body = {"location_id": world["a"].id, "lines": [{"product_id": world["p2"].id, "quantity": 2, "unit_price": "10.00"}]}
    assert client.post("/api/sales", json=body, headers=world["h"]).status_code == 201
    rep = client.get("/api/reports/sales", params={"group_by": "product"}, headers=world["h"]).json()
    assert float(rep["total_revenue"]) == 20.0 and float(rep["total_cost"]) == 6.0 and float(rep["total_margin"]) == 14.0
    assert rep["rows"][0]["units"] == 2 and rep["rows"][0]["orders"] == 1
    csv = client.get("/api/reports/sales/export", params={"group_by": "category"}, headers=world["h"])
    assert csv.status_code == 200 and csv.headers["content-type"].startswith("text/csv")
    assert "Uncategorised" in csv.text


def test_report_validation_and_top_products(client, world):
    bad = client.get("/api/reports/sales", params={"date_from": "2030-02-01", "date_to": "2030-01-01"}, headers=world["h"])
    assert bad.status_code == 422
    assert client.get("/api/reports/sales", params={"group_by": "nope"}, headers=world["h"]).status_code == 422
    assert client.get("/api/reports/top-products", headers=world["h"]).json() == []
