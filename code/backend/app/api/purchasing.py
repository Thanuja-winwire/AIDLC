from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, require_admin
from app.core.pagination import PageParams, page_params, paginate
from app.models.purchasing import POStatus
from app.models.user import User
from app.repositories import purchasing as repo
from app.schemas.common import Page
from app.schemas.purchasing import POCreate, POOut, POUpdate, ReceiveRequest
from app.services import purchasing as svc

router = APIRouter(prefix="/purchase-orders", tags=["purchasing"])


@router.get("", response_model=Page[POOut])
def list_pos(
    status: POStatus | None = None, supplier_id: int | None = None, params: PageParams = Depends(page_params),
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.search_pos(status, supplier_id), params)
    return Page(items=[svc.to_out(r) for r in rows], total=total, page=params.page, size=params.size)


@router.post("", response_model=POOut, status_code=201)
def create_po(body: POCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return svc.to_out(svc.create_po(db, admin, body))


@router.get("/{po_id}", response_model=POOut)
def get_po(po_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return svc.to_out(svc.get_or_404(db, po_id))


@router.put("/{po_id}", response_model=POOut)
def update_po(po_id: int, body: POUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.to_out(svc.update_po(db, po_id, body))


@router.post("/{po_id}/approve", response_model=POOut)
def approve_po(po_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return svc.to_out(svc.approve_po(db, admin, po_id))


@router.post("/{po_id}/cancel", response_model=POOut)
def cancel_po(po_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.to_out(svc.cancel_po(db, po_id))


@router.post("/{po_id}/receive", response_model=POOut)
def receive_po(po_id: int, body: ReceiveRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return svc.to_out(svc.receive_po(db, user, po_id, body))
