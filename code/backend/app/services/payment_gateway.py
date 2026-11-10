import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class ChargeResult:
    success: bool
    reference: str | None
    reason: str | None = None


class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, amount: Decimal, card_number: str, order_ref: str) -> ChargeResult: ...


class MockPaymentGateway(PaymentGateway):
    """4242424242424242 succeeds; 4000000000000002 declines; anything else is invalid."""

    def charge(self, amount: Decimal, card_number: str, order_ref: str) -> ChargeResult:
        digits = card_number.replace(" ", "")
        if digits == "4242424242424242":
            return ChargeResult(True, f"mock_{uuid.uuid4().hex[:16]}")
        if digits == "4000000000000002":
            return ChargeResult(False, None, "Card declined")
        return ChargeResult(False, None, "Invalid test card")


gateway: PaymentGateway = MockPaymentGateway()


def get_gateway() -> PaymentGateway:
    return gateway
