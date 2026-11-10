import re
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Auth ----------
def _password_rule(v: str) -> str:
    if not (8 <= len(v) <= 72):
        raise ValueError("Password must be 8-72 characters")
    if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
        raise ValueError("Password must contain a letter and a digit")
    return v


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str = Field(min_length=1, max_length=100)

    _pw = field_validator("password")(_password_rule)


class LoginIn(BaseModel):
    email: str
    password: str


class ProfileUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    current_password: str | None = None
    new_password: str | None = None

    @field_validator("new_password")
    @classmethod
    def _np(cls, v):
        return _password_rule(v) if v is not None else v


class UserOut(ORM):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Catalog ----------
class CategoryOut(ORM):
    id: int
    name: str
    slug: str


class ProductOut(ORM):
    id: int
    name: str
    description: str
    price: Decimal
    stock: int
    image_url: str
    is_active: bool
    category_id: int
    category: CategoryOut


class ProductPage(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int


class ProductIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    stock: int = Field(ge=0)
    image_url: str = ""
    category_id: int
    is_active: bool = True

    @field_validator("image_url")
    @classmethod
    def _url(cls, v: str) -> str:
        if v and not re.match(r"^https?://", v):
            raise ValueError("Image URL must start with http:// or https://")
        return v


# ---------- Cart ----------
class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=99)


class CartItemOut(BaseModel):
    id: int
    product: ProductOut
    quantity: int
    line_total: Decimal
    unavailable: bool


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: Decimal
    shipping: Decimal
    tax: Decimal
    total: Decimal
    count: int


# ---------- Orders / payment ----------
class AddressIn(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    line1: str = Field(min_length=1, max_length=200)
    line2: str | None = Field(default=None, max_length=200)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=3, max_length=10, pattern=r"^[A-Za-z0-9 -]+$")
    country: str = Field(min_length=2, max_length=100)
    phone: str | None = None

    @field_validator("phone")
    @classmethod
    def _phone(cls, v):
        if v in (None, ""):
            return None
        if not re.fullmatch(r"\d{7,15}", v):
            raise ValueError("Phone must be 7-15 digits")
        return v


class CardIn(BaseModel):
    number: str
    expiry: str
    cvc: str

    @field_validator("number")
    @classmethod
    def _num(cls, v: str) -> str:
        digits = v.replace(" ", "")
        if not re.fullmatch(r"\d{16}", digits):
            raise ValueError("Card number must be 16 digits")
        return digits

    @field_validator("expiry")
    @classmethod
    def _exp(cls, v: str) -> str:
        m = re.fullmatch(r"(0[1-9]|1[0-2])/(\d{2})", v)
        if not m:
            raise ValueError("Expiry must be MM/YY")
        now = datetime.now()
        month, year = int(m.group(1)), 2000 + int(m.group(2))
        if (year, month) < (now.year, now.month):
            raise ValueError("Card has expired")
        return v

    @field_validator("cvc")
    @classmethod
    def _cvc(cls, v: str) -> str:
        if not re.fullmatch(r"\d{3,4}", v):
            raise ValueError("CVC must be 3-4 digits")
        return v


class CheckoutIn(BaseModel):
    address: AddressIn
    card: CardIn


class PayIn(BaseModel):
    card: CardIn


class OrderItemOut(ORM):
    id: int
    product_id: int
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class EventOut(ORM):
    status: str
    created_at: datetime


class PaymentOut(ORM):
    id: int
    amount: Decimal
    status: str
    reference: str | None
    card_last4: str
    failure_reason: str | None
    created_at: datetime


class OrderOut(ORM):
    id: int
    status: str
    subtotal: Decimal
    shipping: Decimal
    tax: Decimal
    total: Decimal
    ship_full_name: str
    ship_line1: str
    ship_line2: str | None
    ship_city: str
    ship_state: str
    ship_postal_code: str
    ship_country: str
    ship_phone: str | None
    created_at: datetime
    user_email: str | None = None
    items: list[OrderItemOut]
    events: list[EventOut]
    payments: list[PaymentOut]


class OrderPage(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int


class CheckoutOut(BaseModel):
    order: OrderOut
    payment_success: bool
    message: str


# ---------- Admin ----------
class StatusUpdateIn(BaseModel):
    status: Literal["processing", "shipped", "delivered", "cancelled"]


class UserAdminUpdate(BaseModel):
    is_active: bool | None = None
    role: Literal["customer", "admin"] | None = None


class UserPage(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    page_size: int


class MetricsOut(BaseModel):
    total_orders: int
    revenue: Decimal
    user_count: int
    low_stock_count: int
    recent_orders: list[OrderOut]
