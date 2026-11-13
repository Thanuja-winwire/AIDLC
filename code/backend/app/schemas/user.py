from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import Role
from app.schemas.common import ORMModel


class UserOut(ORMModel):
    id: int
    email: str
    full_name: str
    role: Role
    is_active: bool
    last_login_at: datetime | None = None


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    role: Role = Role.STAFF


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    role: Role | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
