from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class SupplierIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    contact_person: str | None = None
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=64)
    address: str | None = None


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    contact_person: str | None = None
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=64)
    address: str | None = None
    is_active: bool | None = None


class SupplierOut(ORMModel):
    id: int
    name: str
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    is_active: bool
