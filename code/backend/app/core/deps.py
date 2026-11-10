from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import DomainError
from app.core.security import decode_token
from app.models import User

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise DomainError(401, "Not authenticated")
    payload = decode_token(creds.credentials)
    if not payload or not str(payload.get("sub", "")).isdigit():
        raise DomainError(401, "Invalid or expired token")
    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise DomainError(401, "Invalid or expired token")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise DomainError(403, "Admin access required")
    return user
