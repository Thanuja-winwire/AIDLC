"""Simulated payment gateway.

Cards are validated and exchanged for an opaque token; the token (never the card
number) is what gets stored and charged later. Test cards decide the outcome:
  4000000000000002 -> card_declined
  4000000000009995 -> insufficient_funds
Every other valid card succeeds.
"""
import re
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal

from app.core.errors import AppError

DECLINED_CARD = "4000000000000002"
NSF_CARD = "4000000000009995"
_FAIL_SCENARIOS = {DECLINED_CARD: "declined", NSF_CARD: "nsf"}
_FAIL_REASONS = {"declined": "card_declined", "nsf": "insufficient_funds"}


@dataclass
class TokenizedCard:
    token: str
    brand: str
    last4: str


@dataclass
class ChargeResult:
    success: bool
    reference: str | None = None
    failure_reason: str | None = None


def _digits(number: str) -> str:
    return re.sub(r"[\s-]", "", number or "")


def luhn_valid(number: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(number)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def detect_brand(number: str) -> str:
    if number.startswith("4"):
        return "Visa"
    if number[:2] in {"34", "37"}:
        return "Amex"
    if number[:2] in {"51", "52", "53", "54", "55"} or (
        number[:4].isdigit() and 2221 <= int(number[:4]) <= 2720
    ):
        return "Mastercard"
    return "Card"


def _validation_error(field: str, message: str) -> AppError:
    return AppError(422, "validation_error", "Invalid card details", [{"field": field, "message": message}])


def _check_expiry(expiry: str, now: datetime) -> None:
    m = re.fullmatch(r"(\d{2})\s*/\s*(\d{2}|\d{4})", (expiry or "").strip())
    if not m:
        raise _validation_error("card.expiry", "Use MM/YY")
    month, year = int(m.group(1)), int(m.group(2))
    if year < 100:
        year += 2000
    if not 1 <= month <= 12:
        raise _validation_error("card.expiry", "Invalid month")
    if (year, month) < (now.year, now.month):
        raise _validation_error("card.expiry", "Card has expired")


class SimulatedGateway:
    def tokenize(self, number: str, expiry: str, cvc: str, now: datetime | None = None) -> TokenizedCard:
        """Validate a card and return an opaque token. Raises AppError(422) when invalid."""
        now = now or datetime.now(timezone.utc)
        digits = _digits(number)
        if not digits.isdigit() or not 13 <= len(digits) <= 19:
            raise _validation_error("card.number", "Card number must be 13-19 digits")
        if digits not in _FAIL_SCENARIOS and not luhn_valid(digits):
            raise _validation_error("card.number", "Card number is not valid")
        _check_expiry(expiry, now)
        if not re.fullmatch(r"\d{3,4}", (cvc or "").strip()):
            raise _validation_error("card.cvc", "CVC must be 3 or 4 digits")
        scenario = _FAIL_SCENARIOS.get(digits, "ok")
        token = f"tok_{scenario}_{secrets.token_hex(8)}"
        return TokenizedCard(token=token, brand=detect_brand(digits), last4=digits[-4:])

    def charge(self, token: str, amount: Decimal) -> ChargeResult:
        """Charge a stored token. Never raises for declines — returns a failed result."""
        parts = (token or "").split("_")
        scenario = parts[1] if len(parts) >= 3 and parts[0] == "tok" else None
        if scenario is None:
            return ChargeResult(False, failure_reason="invalid_payment_method")
        if scenario in _FAIL_REASONS:
            return ChargeResult(False, failure_reason=_FAIL_REASONS[scenario])
        return ChargeResult(True, reference=f"sim_{secrets.token_hex(10)}")


def get_gateway() -> SimulatedGateway:
    return SimulatedGateway()
