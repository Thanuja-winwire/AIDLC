from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.pagination import PageParams, page_params, paginate
from app.models.user import User
from app.repositories import operations as repo
from app.schemas.common import Page
from app.schemas.operations import AdjustmentCreate, AdjustmentOut, TransferCreate, TransferOut
from app.services import operations as svc

router = APIRouter(tags=["stock-operations"])


@router.post("/transfers", response_model=TransferOut, status_code=201)
def create_transfer(body: TransferCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return svc.transfer_out(svc.create_transfer(db, user, body))


@router.get("/transfers", response_model=Page[TransferOut])
def list_transfers(
    product_id: int | None = None, location_id: int | None = None, params: PageParams = Depends(page_params),
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.transfer_query(product_id, location_id), params)
    return Page(items=[svc.transfer_out(r) for r in rows], total=total, page=params.page, size=params.size)


@router.post("/adjustments", response_model=AdjustmentOut, status_code=201)
def create_adjustment(body: AdjustmentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return svc.adjustment_out(svc.create_adjustment(db, user, body))


@router.get("/adjustments", response_model=Page[AdjustmentOut])
def list_adjustments(
    product_id: int | None = None, location_id: int | None = None, params: PageParams = Depends(page_params),
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.adjustment_query(product_id, location_id), params)
    return Page(items=[svc.adjustment_out(r) for r in rows], total=total, page=params.page, size=params.size)
