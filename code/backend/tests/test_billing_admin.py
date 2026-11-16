from tests.conftest import DECLINED_CARD, GOOD_CARD
from tests.test_scheduler import make_due


def _sub(client, headers, plan, card=GOOD_CARD):
    r = client.post("/subscriptions", json={"plan_id": plan, "card": card}, headers=headers)
    assert r.status_code == 201, r.text


def _sub_declined(client, headers, plan):
    r = client.post("/subscriptions", json={"plan_id": plan, "card": DECLINED_CARD}, headers=headers)
    assert r.status_code == 402, r.text


def test_customer_payments_are_own_only(client, customer, register, plan_id):
    _sub(client, customer, plan_id("Basic"))
    other = register("other@example.com")
    assert client.get("/payments", headers=other).json()["total"] == 0
    assert client.get("/invoices", headers=other).json()["total"] == 0


def test_admin_plan_crud(client, admin):
    r = client.post(
        "/admin/plans",
        json={"name": "Starter", "price": "4.50", "interval": "monthly", "features": ["a"]},
        headers=admin,
    )
    assert r.status_code == 201 and r.json()["price"] == "4.50"
    pid = r.json()["id"]
    dup = client.post("/admin/plans", json={"name": "starter", "price": "1", "interval": "monthly"}, headers=admin)
    assert dup.status_code == 409
    upd = client.put(f"/admin/plans/{pid}", json={"price": "5.00"}, headers=admin)
    assert upd.json()["price"] == "5.00"
    assert client.post(f"/admin/plans/{pid}/deactivate", headers=admin).json()["is_active"] is False
    assert len(client.get("/admin/plans", headers=admin).json()) == 5


def test_negative_price_rejected(client, admin):
    r = client.post("/admin/plans", json={"name": "Bad", "price": "-1", "interval": "monthly"}, headers=admin)
    assert r.status_code == 422


def test_deactivated_plan_cannot_be_subscribed(client, customer, admin, plan_id):
    basic = plan_id("Basic")
    client.post(f"/admin/plans/{basic}/deactivate", headers=admin)
    r = client.post("/subscriptions", json={"plan_id": basic, "card": GOOD_CARD}, headers=customer)
    assert r.status_code == 409


def test_admin_customers_search(client, customer, register, admin, plan_id):
    _sub(client, customer, plan_id("Pro"))
    register("zed@example.com")
    allc = client.get("/admin/customers", headers=admin).json()
    assert allc["total"] == 2
    found = client.get("/admin/customers?q=casey@example.com", headers=admin).json()
    assert found["total"] == 1 and found["items"][0]["subscription"]["plan"]["name"] == "Pro"


def test_admin_invoices_payments_filters(client, customer, admin, plan_id):
    _sub_declined(client, customer, plan_id("Basic"))
    _sub(client, customer, plan_id("Basic"))
    inv = client.get("/admin/invoices?status=failed", headers=admin).json()
    assert inv["total"] == 1 and inv["items"][0]["customer_email"] == "casey@example.com"
    pay = client.get("/admin/payments?status=succeeded", headers=admin).json()
    assert pay["total"] == 1
    assert client.get("/admin/invoices", headers=admin).json()["total"] == 2


def test_admin_renew_trigger(client, customer, admin, plan_id):
    _sub(client, customer, plan_id("Basic"))
    sub_id = client.get("/subscriptions/current", headers=customer).json()["id"]
    assert client.post(f"/admin/subscriptions/{sub_id}/renew", headers=admin).status_code == 409
    make_due()
    r = client.post(f"/admin/subscriptions/{sub_id}/renew", headers=admin)
    assert r.status_code == 200 and r.json()["status"] == "active"
    assert client.post("/admin/subscriptions/9999/renew", headers=admin).status_code == 404


def test_analytics(client, customer, register, admin, plan_id):
    _sub(client, customer, plan_id("Pro Yearly"))  # 199.00 / 12 = 16.58
    other = register("o@example.com")
    _sub(client, other, plan_id("Basic"))  # 9.99
    s = client.get("/admin/analytics/summary", headers=admin).json()
    assert s["mrr"] == "26.57"
    assert s["active_subscriptions"] == 2 and s["new_subscriptions"] == 2
    assert s["cancellations"] == 0 and s["churn_rate"] == 0
    client.post("/subscriptions/cancel", json={"mode": "immediate"}, headers=other)
    s = client.get("/admin/analytics/summary", headers=admin).json()
    assert s["cancellations"] == 1 and s["mrr"] == "16.58"
    rev = client.get("/admin/analytics/revenue?group_by=month", headers=admin).json()
    assert rev[0]["revenue"] == "208.99"
    plans = {p["plan_name"]: p["subscribers"] for p in client.get("/admin/analytics/plans", headers=admin).json()}
    assert plans["Pro Yearly"] == 1 and plans["Basic"] == 0


def test_analytics_counts_failed_payments(client, customer, admin, plan_id):
    _sub_declined(client, customer, plan_id("Basic"))
    assert client.get("/admin/analytics/summary", headers=admin).json()["failed_payments"] == 1
