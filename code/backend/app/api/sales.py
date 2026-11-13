from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.pagination import PageParams, page_params, paginate
from app.models.user import User
from app.repositories import sales as repo
from app.schemas.common import Page
from app.schemas.sales import SaleCreate, SaleOut
from app.services import sales as svc

router = APIRouter(prefix="/sales", tags=["sales"])


@router.post("", response_model=SaleOut, status_code=201)
def create_sale(body: SaleCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return svc.to_out(svc.create_sale(db, user, body))


@router.get("", response_model=Page[SaleOut])
def list_sales(
    location_id: int | None = None, date_from: date | None = None, date_to: date | None = None,
    params: PageParams = Depends(page_params), db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    start = datetime.combine(date_from, time.min, tzinfo=timezone.utc) if date_from else None
    end = datetime.combine(date_to + timedelta(days=1), time.min, tzinfo=timezone.utc) if date_to else None
    rows, total = paginate(db, repo.sale_query(location_id, start, end), params)
    return Page(items=[svc.to_out(r) for r in rows], total=total, page=params.page, size=params.size)


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return svc.to_out(svc.get_or_404(db, sale_id))
