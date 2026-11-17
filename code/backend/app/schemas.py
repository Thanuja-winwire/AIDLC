"""Pydantic schemas with validation (BR-1..BR-5)."""
from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Status = Literal["Pending", "In Progress", "Completed"]
Priority = Literal["Low", "Medium", "High"]


class TaskIn(BaseModel):
    title: str = Field(..., max_length=400)
    description: str = ""
    priority: Priority = "Medium"
    due_date: Optional[date] = None
    status: Status = "Pending"

    @field_validator("title")
    @classmethod
    def _title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title is required")
        if len(v) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v

    @field_validator("description", mode="before")
    @classmethod
    def _description(cls, v):
        return "" if v is None else v

    def to_record(self) -> dict:
        data = self.model_dump()
        data["due_date"] = self.due_date.isoformat() if self.due_date else None
        return data


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    priority: Priority
    due_date: Optional[str] = None
    status: Status
    created_at: str
    updated_at: str


class DashboardSummary(BaseModel):
    total: int
    by_status: dict
    by_priority: dict
