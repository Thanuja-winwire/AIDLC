from decimal import Decimal

import pytest

from app import models
from app.core.errors import DomainError
from app.services import cart_service as cs


def test_utc_28_tax_calculation():
    assert cs.calc_tax(Decimal("10.00")) == Decimal("0.80")
    assert cs.calc_tax(Decimal("0.06")) == Decimal("0.00")
    assert cs.calc_tax(Decimal("0.00")) == Decimal("0.00")


def test_utc_29_tax_rounding_half_up():
    assert cs.calc_tax(Decimal("0.0625")) == Decimal("0.01")


def test_utc_30_cart_view_totals(db, user, make_product):
    a = make_product("A", "10.00")
    b = make_product("B", "5.50")
    cs.add_item(db, user, a.id, 2)
    view = cs.add_item(db, user, b.id, 1)
    assert view["subtotal"] == Decimal("25.50")
    assert view["tax"] == Decimal("2.04")
    assert view["total"] == Decimal("27.54")
    assert view["count"] == 3
    assert view["shipping"] == Decimal("0.00")


def test_utc_31_cart_view_excludes_inactive(db, user, make_product):
    a = make_product("A", "10.00")
    b = make_product("B", "10.00")
    cs.add_item(db, user, a.id, 1)
    cs.add_item(db, user, b.id, 1)
    b.is_active = False
    db.commit()
    view = cs.get_cart(db, user)
    flags = {i["product"].name: i["unavailable"] for i in view["items"]}
    assert flags == {"A": False, "B": True}
    assert view["subtotal"] == Decimal("10.00") and view["count"] == 1


def test_utc_32_get_or_create_cart_reuses(db, user):
    c1 = cs.get_or_create_cart(db, user)
    c2 = cs.get_or_create_cart(db, user)
    assert c1.id == c2.id


def test_utc_33_add_item_new(db, user, make_product):
    p = make_product(stock=10)
    view = cs.add_item(db, user, p.id, 2)
    assert len(view["items"]) == 1 and view["items"][0]["quantity"] == 2


def test_utc_34_add_item_merges(db, user, make_product):
    p = make_product(stock=10)
    cs.add_item(db, user, p.id, 2)
    view = cs.add_item(db, user, p.id, 3)
    assert len(view["items"]) == 1 and view["items"][0]["quantity"] == 5


def test_utc_35_add_item_missing_product(db, user):
    with pytest.raises(DomainError) as e:
        cs.add_item(db, user, 999, 1)
    assert e.value.status_code == 404 and "Product not found" in e.value.detail


def test_utc_35_add_item_inactive_product(db, user, make_product):
    p = make_product(active=False)
    with pytest.raises(DomainError) as e:
        cs.add_item(db, user, p.id, 1)
    assert e.value.status_code == 404 and "Product not found" in e.value.detail


def test_utc_36_add_item_over_stock(db, user, make_product):
    p = make_product(stock=3)
    with pytest.raises(DomainError) as e:
        cs.add_item(db, user, p.id, 4)
    assert e.value.status_code == 409 and e.value.detail == "Only 3 in stock"


def test_utc_37_add_item_over_99(db, user, make_product):
    p = make_product(stock=200)
    cs.add_item(db, user, p.id, 98)
    with pytest.raises(DomainError) as e:
        cs.add_item(db, user, p.id, 2)
    assert e.value.status_code == 422


def test_utc_38_update_item_qty(db, user, make_product):
    p = make_product(stock=10)
    view = cs.add_item(db, user, p.id, 1)
    view = cs.update_item(db, user, view["items"][0]["id"], 4)
    assert view["items"][0]["quantity"] == 4


def test_utc_39_update_item_over_stock(db, user, make_product):
    p = make_product(stock=3)
    view = cs.add_item(db, user, p.id, 1)
    with pytest.raises(DomainError) as e:
        cs.update_item(db, user, view["items"][0]["id"], 5)
    assert e.value.status_code == 409


def test_utc_40_update_unknown_item(db, user):
    with pytest.raises(DomainError) as e:
        cs.update_item(db, user, 9999, 1)
    assert e.value.status_code == 404 and e.value.detail == "Cart item not found"


def test_utc_40_remove_unknown_item(db, user):
    with pytest.raises(DomainError) as e:
        cs.remove_item(db, user, 9999)
    assert e.value.status_code == 404 and e.value.detail == "Cart item not found"


def test_utc_40_other_users_item(db, user, make_user, make_product):
    p = make_product()
    view = cs.add_item(db, user, p.id, 1)
    other = make_user("b@example.com")
    with pytest.raises(DomainError) as e:
        cs.update_item(db, other, view["items"][0]["id"], 1)
    assert e.value.status_code == 404


def test_utc_41_remove_item(db, user, make_product):
    a, b = make_product("A"), make_product("B")
    cs.add_item(db, user, a.id, 1)
    view = cs.add_item(db, user, b.id, 1)
    remove_id = view["items"][0]["id"]
    view = cs.remove_item(db, user, remove_id)
    assert [i["product"].name for i in view["items"]] == ["B"]


def test_utc_42_clear_cart(db, user, make_product):
    a, b = make_product("A"), make_product("B")
    cs.add_item(db, user, a.id, 1)
    cs.add_item(db, user, b.id, 2)
    view = cs.clear(db, user)
    assert view["items"] == [] and view["subtotal"] == Decimal("0.00")
