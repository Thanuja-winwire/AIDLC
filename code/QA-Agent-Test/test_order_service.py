from decimal import Decimal

import pytest

from app import models
from app.core.errors import DomainError
from app.services import cart_service as cs
from app.services import order_service as os_

from conftest import ADDRESS, DECLINE_CARD, GOOD_CARD


def set_status(db, order, status):
    order.status = status
    db.commit()


def test_utc_46_place_order_success(db, user, make_product):
    a = make_product("A", "10.00", stock=10)
    b = make_product("B", "5.50", stock=10)
    cs.add_item(db, user, a.id, 2)
    cs.add_item(db, user, b.id, 1)
    order = os_.place_order(db, user, ADDRESS)
    assert order.status == "pending"
    assert order.subtotal == Decimal("25.50") and order.tax == Decimal("2.04") and order.total == Decimal("27.54")
    assert (a.stock, b.stock) == (8, 9)
    assert len(order.items) == 2
    assert [e.status for e in order.events] == ["pending"]
    assert cs.get_cart(db, user)["items"] == []


def test_utc_47_place_order_empty_cart(db, user):
    with pytest.raises(DomainError) as e:
        os_.place_order(db, user, ADDRESS)
    assert e.value.status_code == 409 and e.value.detail == "Cart is empty"


def test_utc_48_place_order_unavailable_item(db, user, make_product):
    p = make_product()
    cs.add_item(db, user, p.id, 1)
    p.is_active = False
    db.commit()
    with pytest.raises(DomainError) as e:
        os_.place_order(db, user, ADDRESS)
    assert e.value.status_code == 409


def test_utc_49_place_order_insufficient_stock(db, user, make_product):
    p = make_product("Novel", stock=3)
    cs.add_item(db, user, p.id, 3)
    p.stock = 1
    db.commit()
    with pytest.raises(DomainError) as e:
        os_.place_order(db, user, ADDRESS)
    assert e.value.status_code == 409 and e.value.detail.startswith("Insufficient stock for: ")
    assert "Novel" in e.value.detail
    db.refresh(p)
    assert p.stock == 1


def test_utc_50_pay_success(db, user, make_order):
    order = make_order(user)
    order, ok, _ = os_.pay(db, user, order.id, GOOD_CARD)
    assert ok is True and order.status == "paid"
    assert order.payments[0].status == "success" and order.payments[0].card_last4 == "4242"


def test_utc_51_pay_declined(db, user, make_order):
    order = make_order(user)
    order, ok, msg = os_.pay(db, user, order.id, DECLINE_CARD)
    assert ok is False and order.status == "payment_failed"
    assert order.payments[0].status == "failed" and order.payments[0].failure_reason == "Card declined"
    assert msg == "Card declined"


def test_utc_52_retry_payment_after_failure(db, user, make_order):
    order = make_order(user)
    os_.pay(db, user, order.id, DECLINE_CARD)
    order, ok, _ = os_.pay(db, user, order.id, GOOD_CARD)
    assert ok is True and order.status == "paid"


@pytest.mark.parametrize("status", ["paid", "cancelled"])
def test_utc_53_pay_invalid_status(db, user, make_order, status):
    order = make_order(user)
    set_status(db, order, status)
    with pytest.raises(DomainError) as e:
        os_.pay(db, user, order.id, GOOD_CARD)
    assert e.value.status_code == 409


@pytest.mark.parametrize("op", ["get", "pay", "cancel"])
def test_utc_54_order_ownership(db, user, make_user, make_order, op):
    order = make_order(user)
    other = make_user("b@example.com")
    with pytest.raises(DomainError) as e:
        if op == "get":
            os_.get_own_order(db, other, order.id)
        elif op == "pay":
            os_.pay(db, other, order.id, GOOD_CARD)
        else:
            os_.cancel_order(db, other, order.id)
    assert e.value.status_code == 404


def test_utc_55_list_orders_pagination(db, user, make_user, make_order):
    mine = [make_order(user).id for _ in range(3)]
    make_order(make_user("b@example.com"))
    items, total = os_.list_orders(db, user, 1, 2)
    assert total == 3 and len(items) == 2
    assert [o.id for o in items] == sorted(mine, reverse=True)[:2]


def test_utc_56_customer_cancel_restores_stock(db, user, make_product):
    p = make_product(stock=10)
    cs.add_item(db, user, p.id, 3)
    order = os_.place_order(db, user, ADDRESS)
    os_.pay(db, user, order.id, GOOD_CARD)
    assert p.stock == 7
    order = os_.cancel_order(db, user, order.id)
    db.refresh(p)
    assert order.status == "cancelled" and p.stock == 10
    assert order.payments[0].status == "refunded"


@pytest.mark.parametrize("status", ["shipped", "delivered", "cancelled"])
def test_utc_57_customer_cancel_not_allowed(db, user, make_order, status):
    order = make_order(user)
    set_status(db, order, status)
    with pytest.raises(DomainError) as e:
        os_.cancel_order(db, user, order.id)
    assert e.value.status_code == 409


def test_utc_58_admin_forward_transitions(db, user, make_user, make_order):
    admin = make_user("admin@example.com", "admin")
    order = make_order(user)
    set_status(db, order, "paid")
    for s in ["processing", "shipped", "delivered"]:
        order = os_.admin_update_status(db, admin, order.id, s)
        assert order.status == s
        assert order.events[-1].status == s


@pytest.mark.parametrize("start,target", [("paid", "shipped"), ("paid", "delivered"), ("shipped", "paid")])
def test_utc_59_admin_invalid_transition(db, user, make_user, make_order, start, target):
    admin = make_user("admin@example.com", "admin")
    order = make_order(user)
    set_status(db, order, start)
    with pytest.raises(DomainError) as e:
        os_.admin_update_status(db, admin, order.id, target)
    assert e.value.status_code == 409


@pytest.mark.parametrize("status", ["pending", "paid", "shipped", "payment_failed"])
def test_utc_60_admin_cancel_allowed(db, user, make_user, make_product, status):
    admin = make_user("admin@example.com", "admin")
    p = make_product(stock=10)
    cs.add_item(db, user, p.id, 2)
    order = os_.place_order(db, user, ADDRESS)
    set_status(db, order, status)
    order = os_.admin_update_status(db, admin, order.id, "cancelled")
    db.refresh(p)
    assert order.status == "cancelled" and p.stock == 10


@pytest.mark.parametrize("status", ["delivered", "cancelled"])
def test_utc_60_admin_cancel_rejected(db, user, make_user, make_order, status):
    admin = make_user("admin@example.com", "admin")
    order = make_order(user)
    set_status(db, order, status)
    with pytest.raises(DomainError) as e:
        os_.admin_update_status(db, admin, order.id, "cancelled")
    assert e.value.status_code == 409


def test_utc_61_admin_list_filter(db, user, make_order):
    o1, o2, o3 = (make_order(user) for _ in range(3))
    set_status(db, o1, "paid")
    set_status(db, o3, "paid")
    items, total = os_.admin_list_orders(db, "paid", 1, 10)
    assert total == 2 and {o.id for o in items} == {o1.id, o3.id}


def test_utc_62_admin_get_missing_order(db):
    with pytest.raises(DomainError) as e:
        os_.admin_get_order(db, 9999)
    assert e.value.status_code == 404
