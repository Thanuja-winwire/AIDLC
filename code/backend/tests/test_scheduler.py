from datetime import timedelta

from sqlalchemy import select

from app.core.database import SessionLocal
from app.gateway import SimulatedGateway
from app.models import Payment, Subscription, utcnow
from app.scheduler import run_renewals
from tests.conftest import DECLINED_CARD, GOOD_CARD


def make_due(days: int = 1) -> None:
    """Move the (only) subscription's period into the past so it is due for renewal."""
    with SessionLocal() as db:
        sub = db.scalars(select(Subscription)).first()
        sub.current_period_start -= timedelta(days=30 + days)
        sub.current_period_end = utcnow() - timedelta(days=days)
        db.commit()


def _sub(client, headers, plan_id, card=GOOD_CARD):
    r = client.post("/subscriptions", json={"plan_id": plan_id, "card": card}, headers=headers)
    assert r.status_code == 201, r.text


def _current(client, headers):
    return client.get("/subscriptions/current", headers=headers).json()


def test_scheduler_renews_due_subscription(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    make_due()
    due_end = _current(client, customer)["current_period_end"]
    assert run_renewals() == 1
    cur = _current(client, customer)
    assert cur["status"] == "active" and cur["current_period_end"] > due_end
    kinds = [i["type"] for i in client.get("/invoices", headers=customer).json()["items"]]
    assert kinds.count("renewal") == 1


def test_scheduler_is_idempotent(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    make_due()
    run_renewals()
    assert run_renewals() == 0
    assert len(client.get("/invoices", headers=customer).json()["items"]) == 2


def test_failed_renewal_goes_past_due_then_expires(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    client.put("/payment-method", json={"card": DECLINED_CARD}, headers=customer)
    make_due()
    run_renewals()
    cur = _current(client, customer)
    assert cur["status"] == "past_due" and cur["renewal_attempts"] == 1
    run_renewals()
    assert _current(client, customer)["renewal_attempts"] == 2
    run_renewals()
    assert _current(client, customer) is None  # expired after 3 attempts
    with SessionLocal() as db:
        assert db.scalars(select(Subscription)).first().status == "expired"
        assert len(db.scalars(select(Payment).where(Payment.status == "failed")).all()) == 3
    # retries reuse one renewal invoice
    renewals = [i for i in client.get("/invoices", headers=customer).json()["items"] if i["type"] == "renewal"]
    assert len(renewals) == 1


def test_recover_from_past_due_with_new_card(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    client.put("/payment-method", json={"card": DECLINED_CARD}, headers=customer)
    make_due()
    run_renewals()
    client.put("/payment-method", json={"card": GOOD_CARD}, headers=customer)
    r = client.post("/subscriptions/renew", headers=customer)
    assert r.status_code == 200 and r.json()["status"] == "active" and r.json()["renewal_attempts"] == 0


def test_manual_renew_failure_returns_402(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    client.put("/payment-method", json={"card": DECLINED_CARD}, headers=customer)
    make_due()
    r = client.post("/subscriptions/renew", headers=customer)
    assert r.status_code == 402 and r.json()["error"]["details"]["reason"] == "card_declined"


def test_manual_renew_not_due_conflicts(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    assert client.post("/subscriptions/renew", headers=customer).status_code == 409


def test_cancel_at_period_end_not_charged_on_renewal(client, customer, plan_id):
    _sub(client, customer, plan_id("Basic"))
    client.post("/subscriptions/cancel", json={"mode": "period_end"}, headers=customer)
    make_due()
    run_renewals()
    assert _current(client, customer) is None
    with SessionLocal() as db:
        assert db.scalars(select(Subscription)).first().status == "cancelled"
    assert len(client.get("/invoices", headers=customer).json()["items"]) == 1


def test_renewal_uses_price_at_subscription(client, customer, admin, plan_id):
    basic = plan_id("Basic")
    _sub(client, customer, basic)
    client.put(f"/admin/plans/{basic}", json={"price": "50.00"}, headers=admin)
    make_due()
    run_renewals()
    renewal = next(i for i in client.get("/invoices", headers=customer).json()["items"] if i["type"] == "renewal")
    assert renewal["amount"] == "9.99"


def test_gateway_import_for_scheduler():
    assert SimulatedGateway()
