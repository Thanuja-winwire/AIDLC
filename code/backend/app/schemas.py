import re
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, field_validator

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^\+?[0-9 \-]+$")


def _clean(value: Any) -> str:
    if value is None:
        return ""
    if not isinstance(value, str):
        raise ValueError("Enter a valid value")
    return value.strip()


class StudentBase(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    course: str = ""
    enrollment_date: date | None = None

    model_config = ConfigDict(validate_default=True)

    @field_validator("name", mode="before")
    @classmethod
    def _name(cls, v: Any) -> str:
        v = _clean(v)
        if not v:
            raise ValueError("Name is required")
        if len(v) > 100:
            raise ValueError("Name must be at most 100 characters")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def _email(cls, v: Any) -> str:
        v = _clean(v)
        if not v:
            raise ValueError("Email is required")
        if len(v) > 254 or not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address")
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def _phone(cls, v: Any) -> str:
        v = _clean(v)
        if not v:
            raise ValueError("Phone is required")
        digits = sum(c.isdigit() for c in v)
        if not PHONE_RE.match(v) or not 7 <= digits <= 15:
            raise ValueError("Enter a valid phone number (7-15 digits)")
        return v

    @field_validator("course", mode="before")
    @classmethod
    def _course(cls, v: Any) -> str:
        v = _clean(v)
        if not v:
            raise ValueError("Course is required")
        if len(v) > 100:
            raise ValueError("Course must be at most 100 characters")
        return v

    @field_validator("enrollment_date", mode="before")
    @classmethod
    def _date(cls, v: Any) -> date:
        if v is None or (isinstance(v, str) and not v.strip()):
            raise ValueError("Enrollment date is required")
        if isinstance(v, date):
            return v
        try:
            return date.fromisoformat(str(v).strip())
        except ValueError:
            raise ValueError("Enter a valid date")


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    pass


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str
    course: str
    enrollment_date: date
    created_at: datetime
    updated_at: datetime


class CourseCount(BaseModel):
    course: str
    count: int


class DashboardOut(BaseModel):
    total_students: int
    courses: list[CourseCount]
