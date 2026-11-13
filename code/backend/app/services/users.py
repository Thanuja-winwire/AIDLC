from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.user import Role, User
from app.repositories import users as users_repo
from app.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, data: UserCreate) -> User:
    email = data.email.strip().lower()
    if users_repo.get_by_email(db, email):
        raise ConflictError("A user with this email already exists")
    user = User(
        email=email, full_name=data.full_name.strip(), password_hash=hash_password(data.password),
        role=data.role, is_active=True,
    )
    return users_repo.add(db, user)


def update_user(db: Session, actor: User, user_id: int, data: UserUpdate) -> User:
    user = users_repo.get_by_id(db, user_id)
    if user is None:
        raise NotFoundError("User not found")
    new_role = data.role if data.role is not None else user.role
    new_active = data.is_active if data.is_active is not None else user.is_active
    loses_admin = user.role == Role.ADMIN and user.is_active and (new_role != Role.ADMIN or not new_active)
    if loses_admin:
        if user.id == actor.id:
            raise ConflictError("You cannot deactivate or demote your own account")
        if users_repo.count_active_admins(db, exclude_user_id=user.id) == 0:
            raise ConflictError("Cannot deactivate or demote the last active Admin")
    if data.full_name is not None:
        user.full_name = data.full_name.strip()
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    user.role = new_role
    user.is_active = new_active
    db.flush()
    return user


def seed_default_admin(db: Session) -> bool:
    """BR-A6: create the default Admin only if no users exist."""
    if users_repo.count_users(db) > 0:
        return False
    users_repo.add(
        db,
        User(
            email=settings.default_admin_email.strip().lower(),
            full_name="Administrator",
            password_hash=hash_password(settings.default_admin_password),
            role=Role.ADMIN,
            is_active=True,
        ),
    )
    return True
