import pytest
from sqlalchemy import select

from app.core.errors import InsufficientStockError
from app.models.catalog import Product
from app.models.inventory import Location, MovementType, StockMovement
from app.models.user import Role
from app.services.stock_ledger import StockLedger


@pytest.fixture()
def setup(db_session):
    product = Product(sku="P1", name="Widget", unit_cost=1, sale_price=2, reorder_level=0)
    loc = Location(code="MAIN", name="Main")
    db_session.add_all([product, loc])
    db_session.commit()
    return product, loc


def test_apply_creates_level_and_movement(db_session, setup):
    product, loc = setup
    ledger = StockLedger(db_session, None)
    m = ledger.apply(product_id=product.id, location_id=loc.id, delta=5, movement_type=MovementType.ADJUSTMENT)
    assert m.quantity_after == 5
    assert ledger.current_quantity(product.id, loc.id) == 5


def test_negative_result_rejected_and_nothing_recorded(db_session, setup):
    product, loc = setup
    ledger = StockLedger(db_session, None)
    ledger.apply(product_id=product.id, location_id=loc.id, delta=2, movement_type=MovementType.ADJUSTMENT)
    with pytest.raises(InsufficientStockError):
        ledger.apply(product_id=product.id, location_id=loc.id, delta=-3, movement_type=MovementType.SALE)
    assert ledger.current_quantity(product.id, loc.id) == 2
    assert len(db_session.scalars(select(StockMovement)).all()) == 1


def test_zero_delta_is_rejected(db_session, setup):
    product, loc = setup
    with pytest.raises(ValueError):
        StockLedger(db_session, None).apply(
            product_id=product.id, location_id=loc.id, delta=0, movement_type=MovementType.ADJUSTMENT
        )


def test_locations_api_and_stock_view(client, auth_headers, db_session):
    admin = auth_headers(Role.ADMIN)
    loc = client.post("/api/locations", json={"code": "wh1", "name": "Warehouse"}, headers=admin)
    assert loc.status_code == 201 and loc.json()["code"] == "WH1"
    assert client.post("/api/locations", json={"code": "WH1", "name": "Dup"}, headers=admin).status_code == 409
    staff = auth_headers(Role.STAFF)
    assert client.post("/api/locations", json={"code": "X", "name": "x"}, headers=staff).status_code == 403
    assert client.get("/api/stock", headers=staff).json()["total"] == 0


def test_cannot_deactivate_location_with_stock(client, auth_headers, db_session, setup):
    admin = auth_headers(Role.ADMIN)
    product, loc = setup
    StockLedger(db_session, None).apply(
        product_id=product.id, location_id=loc.id, delta=4, movement_type=MovementType.ADJUSTMENT
    )
    db_session.commit()
    assert client.patch(f"/api/locations/{loc.id}", json={"is_active": False}, headers=admin).status_code == 409
