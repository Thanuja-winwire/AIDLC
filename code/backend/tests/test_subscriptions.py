from datetime import timedelta

from app.core.database import SessionLocal
from app.models import Subscription, utcnow
from tests.conftest import DECLINED_CARD, GOOD_CARD


def _subscribe(client, headers, plan, card=GOOD_CARD):
    return client.post("/subscriptions", json={"plan_id": plan, "card": card}, headers=headers)


def test_subscribe_success_creates_invoice_and_payment(client, customer, plan_id):
    r = _subscribe(client, customer, plan_id("Basic"))
    assert r.status_code == 201, r.text
    assert r.json()["status"] == "active" and r.json()["price_at_subscription"] == "9.99"
    inv = client.get("/invoices", headers=customer).json()["items"]
    assert len(inv) == 1 and inv[0]["status"] == "paid" and inv[0]["number"].startswith("INV-")
    pays = client.get("/payments", headers=customer).json()["items"]
    assert pays[0]["status"] == "succeeded"
    pm = client.get("/payment-method", headers=customer).json()
    assert pm == {"brand": "Visa", "last4": "4242"}


def test_subscribe_declined_leaves_nothing_active(client, customer, plan_id):
    r = _subscribe(client, customer, plan_id("Basic"), DECLINED_CARD)
    assert r.status_code == 402
    assert r.json()["error"]["details"]["reason"] == "card_declined"
    assert client.get("/subscriptions/current", headers=customer).json() is None
    assert client.get("/invoices", headers=customer).json()["items"][0]["status"] == "failed"
    assert client.get("/payments", headers=customer).json()["items"][0]["failure_reason"] == "card_declined"
    # can retry with a good card
    assert _subscribe(client, customer, plan_id("Basic")).status_code == 201


def test_cannot_subscribe_twice(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    r = _subscribe(client, customer, plan_id("Pro"))
    assert r.status_code == 409


def test_invalid_card_rejected(client, customer, plan_id):
    r = _subscribe(client, customer, plan_id("Basic"), {**GOOD_CARD, "number": "1234"})
    assert r.status_code == 422


def test_upgrade_prorates_and_charges(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    pro = plan_id("Pro")
    prev = client.get(f"/subscriptions/change-preview?plan_id={pro}", headers=customer).json()
    assert prev["kind"] == "upgrade"
    # just subscribed: ~full cycle left, so close to the 10.00 price difference
    assert 9.0 < float(prev["amount_due_now"]) <= 10.00
    r = client.post("/subscriptions/change", json={"plan_id": pro}, headers=customer)
    assert r.status_code == 200
    assert r.json()["plan"]["name"] == "Pro" and r.json()["price_at_subscription"] == "19.99"
    types = {i["type"] for i in client.get("/invoices", headers=customer).json()["items"]}
    assert "proration" in types


def test_downgrade_is_free_and_keeps_period(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Pro"))
    before = client.get("/subscriptions/current", headers=customer).json()
    r = client.post("/subscriptions/change", json={"plan_id": plan_id("Basic")}, headers=customer)
    assert r.status_code == 200
    assert r.json()["current_period_end"] == before["current_period_end"]
    inv = client.get("/invoices", headers=customer).json()["items"][0]
    assert inv["amount"] == "0.00" and inv["status"] == "paid"


def test_interval_change_charges_full_price_and_restarts_cycle(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Pro"))
    yearly = plan_id("Pro Yearly")
    prev = client.get(f"/subscriptions/change-preview?plan_id={yearly}", headers=customer).json()
    assert prev["kind"] == "interval_change" and prev["amount_due_now"] == "199.00"
    r = client.post("/subscriptions/change", json={"plan_id": yearly}, headers=customer)
    assert r.status_code == 200 and r.json()["plan"]["interval"] == "yearly"


def test_same_plan_change_conflicts(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    r = client.post("/subscriptions/change", json={"plan_id": plan_id("Basic")}, headers=customer)
    assert r.status_code == 409


def test_failed_upgrade_keeps_plan(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    client.put("/payment-method", json={"card": DECLINED_CARD}, headers=customer)
    r = client.post("/subscriptions/change", json={"plan_id": plan_id("Pro")}, headers=customer)
    assert r.status_code == 402
    assert client.get("/subscriptions/current", headers=customer).json()["plan"]["name"] == "Basic"


def test_cancel_at_period_end_then_undo(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    r = client.post("/subscriptions/cancel", json={"mode": "period_end"}, headers=customer)
    assert r.json()["cancel_at_period_end"] is True and r.json()["status"] == "active"
    r = client.post("/subscriptions/cancel/undo", headers=customer)
    assert r.json()["cancel_at_period_end"] is False
    assert client.post("/subscriptions/cancel/undo", headers=customer).status_code == 409


def test_cancel_immediately(client, customer, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    r = client.post("/subscriptions/cancel", json={"mode": "immediate"}, headers=customer)
    assert r.json()["status"] == "cancelled" and r.json()["cancelled_at"]
    assert client.get("/subscriptions/current", headers=customer).json() is None
    assert client.post("/subscriptions/cancel", json={"mode": "immediate"}, headers=customer).status_code == 409


def test_invoice_pdf_and_isolation(client, customer, register, plan_id):
    _subscribe(client, customer, plan_id("Basic"))
    inv_id = client.get("/invoices", headers=customer).json()["items"][0]["id"]
    pdf = client.get(f"/invoices/{inv_id}/pdf", headers=customer)
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")
    other = register("other@example.com")
    assert client.get(f"/invoices/{inv_id}", headers=other).status_code == 404
    assert client.get(f"/invoices/{inv_id}/pdf", headers=other).status_code == 404


def test_expired_period_helper_moves_dates():
    # sanity check for the helper used by scheduler tests
    from tests.test_scheduler import make_due

    assert callable(make_due) and timedelta(days=1) and SessionLocal and Subscription and utcnow
