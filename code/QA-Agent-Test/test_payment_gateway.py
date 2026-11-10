from decimal import Decimal

from app.services.payment_gateway import MockPaymentGateway


def test_utc_43_mock_gateway_success():
    r = MockPaymentGateway().charge(Decimal("10.00"), "4242424242424242", "o-1")
    assert r.success is True and r.reference.startswith("mock_")


def test_utc_44_mock_gateway_decline():
    r = MockPaymentGateway().charge(Decimal("10.00"), "4000000000000002", "o-1")
    assert r.success is False and r.reason == "Card declined"


def test_utc_45_mock_gateway_invalid_card():
    r = MockPaymentGateway().charge(Decimal("10.00"), "4111111111111111", "o-1")
    assert r.success is False and r.reason == "Invalid test card"
