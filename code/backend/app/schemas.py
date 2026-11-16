from datetime import datetime
from decimal import Decimal
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, PlainSerializer

# Money is serialised as a string with 2 decimals in JSON.
Money = Annotated[
    Decimal,
    PlainSerializer(lambda v: f"{Decimal(v):.2f}", return_type=str, when_used="json"),
]

T = TypeVar("T")


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


# ---- auth ----
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=200)


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(ORM):
    id: int
    email: str
    name: str = Field(validation_alias="full_name")
    role: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- plans ----
class PlanIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = ""
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    interval: Literal["monthly", "yearly"]
    features: list[str] = []


class PlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    interval: Literal["monthly", "yearly"] | None = None
    features: list[str] | None = None


class PlanOut(ORM):
    id: int
    name: str
    description: str
    price: Money
    interval: str
    features: list[str]
    is_active: bool


# ---- payment method ----
class CardIn(BaseModel):
    number: str
    expiry: str
    cvc: str
    name: str | None = None


class PaymentMethodIn(BaseModel):
    card: CardIn


class PaymentMethodOut(ORM):
    brand: str
    last4: str


# ---- subscriptions ----
class SubscribeIn(BaseModel):
    plan_id: int
    card: CardIn | None = None  # optional when a payment method is already stored


class ChangePlanIn(BaseModel):
    plan_id: int


class CancelIn(BaseModel):
    mode: Literal["period_end", "immediate"] = "period_end"


class SubscriptionOut(ORM):
    id: int
    status: str
    plan: PlanOut
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    cancelled_at: datetime | None
    renewal_attempts: int
    price_at_subscription: Money
    created_at: datetime


class ChangePreviewOut(BaseModel):
    kind: Literal["upgrade", "downgrade", "interval_change"]
    amount_due_now: Money
    new_plan: PlanOut
    new_price: Money
    new_period_end: datetime
    explanation: str


# ---- billing ----
class InvoiceLineOut(ORM):
    id: int
    description: str
    amount: Money


class PaymentOut(ORM):
    id: int
    invoice_id: int
    invoice_number: str | None = None
    user_id: int
    amount: Money
    status: str
    gateway_reference: str | None
    failure_reason: str | None
    attempted_at: datetime


class InvoiceOut(ORM):
    id: int
    number: str | None
    user_id: int
    subscription_id: int
    type: str
    status: str
    amount: Money
    period_start: datetime
    period_end: datetime
    issued_at: datetime
    paid_at: datetime | None
    lines: list[InvoiceLineOut]
    payments: list[PaymentOut] = []
    customer_email: str | None = None


# ---- admin / analytics ----
class CustomerOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    subscription: SubscriptionOut | None


class AnalyticsSummary(BaseModel):
    mrr: Money
    active_subscriptions: int
    new_subscriptions: int
    cancellations: int
    churn_rate: float
    failed_payments: int
    period_start: datetime
    period_end: datetime


class RevenuePoint(BaseModel):
    period: str
    revenue: Money


class PlanSubscribers(BaseModel):
    plan_id: int
    plan_name: str
    subscribers: int
