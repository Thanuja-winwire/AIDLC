from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_admin
from app.core.pagination import PageParams, page_params, paginate
from app.models.user import User
from app.repositories import users as repo
from app.schemas.common import Page
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services import users as svc

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=Page[UserOut])
def list_users(params: PageParams = Depends(page_params), db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows, total = paginate(db, repo.list_users(db), params)
    return Page(items=[UserOut.model_validate(r) for r in rows], total=total, page=params.page, size=params.size)


@router.post("", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.create_user(db, body)


@router.patch("/{user_id}", response_model=UserOut)
@router.put("/{user_id}", response_model=UserOut, include_in_schema=False)
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return svc.update_user(db, admin, user_id, body)
