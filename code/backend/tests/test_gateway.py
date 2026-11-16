from datetime import datetime, timezone
from decimal import Decimal

import pytest

from app.core.errors import AppError
from app.gateway import DECLINED_CARD, NSF_CARD, SimulatedGateway, luhn_valid

NOW = datetime(2025, 1, 15, tzinfo=timezone.utc)
gw = SimulatedGateway()


def test_luhn():
    assert luhn_valid("4242424242424242")
    assert not luhn_valid("4242424242424241")


def test_tokenize_valid_visa():
    card = gw.tokenize("4242 4242 4242 4242", "12/30", "123", now=NOW)
    assert card.brand == "Visa"
    assert card.last4 == "4242"
    assert card.token.startswith("tok_ok_")


def test_brands():
    assert gw.tokenize("5555555555554444", "12/30", "123", now=NOW).brand == "Mastercard"
    assert gw.tokenize("378282246310005", "12/30", "1234", now=NOW).brand == "Amex"


@pytest.mark.parametrize(
    "number,expiry,cvc,field",
    [
        ("1234", "12/30", "123", "card.number"),
        ("4242424242424241", "12/30", "123", "card.number"),
        ("4242424242424242", "01/20", "123", "card.expiry"),
        ("4242424242424242", "13/30", "123", "card.expiry"),
        ("4242424242424242", "abc", "123", "card.expiry"),
        ("4242424242424242", "12/30", "12", "card.cvc"),
    ],
)
def test_tokenize_rejects_invalid(number, expiry, cvc, field):
    with pytest.raises(AppError) as exc:
        gw.tokenize(number, expiry, cvc, now=NOW)
    assert exc.value.status_code == 422
    assert exc.value.details[0]["field"] == field


def test_charge_success_has_reference():
    token = gw.tokenize("4242424242424242", "12/30", "123", now=NOW).token
    result = gw.charge(token, Decimal("9.99"))
    assert result.success and result.reference.startswith("sim_")


@pytest.mark.parametrize("card,reason", [(DECLINED_CARD, "card_declined"), (NSF_CARD, "insufficient_funds")])
def test_test_cards_fail(card, reason):
    token = gw.tokenize(card, "12/30", "123", now=NOW).token
    result = gw.charge(token, Decimal("5.00"))
    assert not result.success
    assert result.failure_reason == reason


def test_invalid_token_fails():
    assert gw.charge("garbage", Decimal("1")).failure_reason == "invalid_payment_method"
