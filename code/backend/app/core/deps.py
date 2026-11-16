from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import forbidden, unauthorized
from app.core.security import decode_access_token
from app.models import User

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise unauthorized("Authentication required")
    payload = decode_access_token(creds.credentials)
    if payload is None:
        raise unauthorized("Invalid or expired token")
    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise unauthorized("Invalid token")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise unauthorized("Account not available")
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role != "customer":
        raise forbidden("Customer account required")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise forbidden("Admin access required")
    return user
