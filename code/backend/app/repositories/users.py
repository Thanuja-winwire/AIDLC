from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import Role, User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.strip().lower()))


def list_users(db: Session):
    return select(User).order_by(User.full_name, User.id)


def count_users(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(User)) or 0


def count_active_admins(db: Session, exclude_user_id: int | None = None) -> int:
    stmt = select(func.count()).select_from(User).where(User.role == Role.ADMIN, User.is_active.is_(True))
    if exclude_user_id is not None:
        stmt = stmt.where(User.id != exclude_user_id)
    return db.scalar(stmt) or 0


def add(db: Session, user: User) -> User:
    db.add(user)
    db.flush()
    return user
