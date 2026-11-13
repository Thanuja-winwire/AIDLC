from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, require_admin
from app.core.pagination import PageParams, page_params, paginate
from app.models.user import User
from app.repositories import suppliers as repo
from app.schemas.common import Page
from app.schemas.supplier import SupplierIn, SupplierOut, SupplierUpdate
from app.services import suppliers as svc

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("", response_model=Page[SupplierOut])
def list_suppliers(
    q: str | None = None, active: bool | None = None, params: PageParams = Depends(page_params),
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.search_suppliers(q, active), params)
    return Page(items=[SupplierOut.model_validate(r) for r in rows], total=total, page=params.page, size=params.size)


@router.post("", response_model=SupplierOut, status_code=201)
def create_supplier(body: SupplierIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.create_supplier(db, body)


@router.get("/{supplier_id}", response_model=SupplierOut)
def get_supplier(supplier_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return svc.get_or_404(db, supplier_id)


@router.patch("/{supplier_id}", response_model=SupplierOut)
@router.put("/{supplier_id}", response_model=SupplierOut, include_in_schema=False)
def update_supplier(supplier_id: int, body: SupplierUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.update_supplier(db, supplier_id, body)
