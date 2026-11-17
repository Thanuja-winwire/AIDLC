from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .errors import DuplicateEmailError
from .models import Student


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class StudentRepository:
    """The only layer that touches the ORM session."""

    def __init__(self, db: Session):
        self.db = db

    def get(self, student_id: int) -> Student | None:
        return self.db.get(Student, student_id)

    def get_by_email(self, email: str, exclude_id: int | None = None) -> Student | None:
        stmt = select(Student).where(func.lower(Student.email) == email.lower())
        if exclude_id is not None:
            stmt = stmt.where(Student.id != exclude_id)
        return self.db.execute(stmt).scalars().first()

    def list(self, q: str | None = None) -> list[Student]:
        stmt = select(Student)
        term = (q or "").strip().lower()
        if term:
            pattern = f"%{_escape_like(term)}%"
            stmt = stmt.where(
                or_(
                    *[
                        func.lower(col).like(pattern, escape="\\")
                        for col in (Student.name, Student.email, Student.phone, Student.course)
                    ]
                )
            )
        stmt = stmt.order_by(Student.created_at.desc(), Student.id.desc())
        return [s for s in self.db.execute(stmt).scalars().all()]

    def add(self, student: Student) -> Student:
        self.db.add(student)
        self._commit()
        return student

    def update(self, student: Student, values: dict) -> Student:
        for key, value in values.items():
            setattr(student, key, value)
        student.updated_at = datetime.now(timezone.utc)
        self._commit()
        return student

    def delete(self, student: Student) -> None:
        self.db.delete(student)
        self.db.commit()

    def count(self) -> int:
        return self.db.execute(select(func.count(Student.id))).scalar_one()

    def courses_in_creation_order(self) -> list[str]:
        stmt = select(Student.course).order_by(Student.created_at.asc(), Student.id.asc())
        return [c for c in self.db.execute(stmt).scalars().all()]

    def _commit(self) -> None:
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise DuplicateEmailError()
