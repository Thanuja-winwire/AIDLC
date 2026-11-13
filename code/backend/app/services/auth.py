from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.errors import AuthenticationError
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.repositories import users as users_repo


def login(db: Session, email: str, password: str) -> tuple[User, str]:
    user = users_repo.get_by_email(db, email)
    # Same generic error for unknown user, wrong password and inactive account (BR-A1).
    if user is None or not user.is_active or not verify_password(password, user.password_hash):
        raise AuthenticationError("Invalid credentials")
    user.last_login_at = datetime.now(timezone.utc)
    db.flush()
    return user, create_access_token(user.id, user.role.value)
