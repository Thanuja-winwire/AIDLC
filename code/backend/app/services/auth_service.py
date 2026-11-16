from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import conflict, unauthorized
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas import RegisterIn, TokenOut, UserOut


def register(db: Session, data: RegisterIn) -> User:
    email = data.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise conflict("An account with this email already exists", "email_taken")
    user = User(
        email=email,
        password_hash=hash_password(data.password),
        full_name=data.name.strip(),
        role="customer",
    )
    db.add(user)
    db.commit()
    return user


def login(db: Session, email: str, password: str) -> TokenOut:
    user = db.scalar(select(User).where(User.email == email.strip().lower()))
    # Generic failure: never reveal which field was wrong (BR-A3).
    if user is None or not user.is_active or not verify_password(password, user.password_hash):
        raise unauthorized("Invalid email or password")
    return TokenOut(
        access_token=create_access_token(user.id, user.role),
        user=UserOut.model_validate(user),
    )
