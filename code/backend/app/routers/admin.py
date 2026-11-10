from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app import schemas
from app.core.database import get_db
from app.core.deps import require_admin
from app.models import User
from app.services import admin_service, catalog_auth, order_service

router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])


@router.get("/metrics", response_model=schemas.MetricsOut)
def metrics(db: Session = Depends(get_db)):
    return admin_service.metrics(db)


@router.get("/products", response_model=schemas.ProductPage)
def list_products(
    q: str | None = None,
    include_inactive: bool = True,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    items, total = catalog_auth.list_products(db, q, None, None, None, False, "newest", page, page_size, include_inactive)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/products", response_model=schemas.ProductOut, status_code=201)
def create_product(body: schemas.ProductIn, db: Session = Depends(get_db)):
    return admin_service.create_product(db, body.model_dump())


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, body: schemas.ProductIn, db: Session = Depends(get_db)):
    return admin_service.update_product(db, product_id, body.model_dump())


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    admin_service.delete_product(db, product_id)
    return Response(status_code=204)


@router.get("/users", response_model=schemas.UserPage)
def list_users(q: str | None = None, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=50), db: Session = Depends(get_db)):
    items, total = admin_service.list_users(db, q, page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    from app.core.errors import DomainError

    u = db.get(User, user_id)
    if not u:
        raise DomainError(404, "User not found")
    return u


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, body: schemas.UserAdminUpdate, db: Session = Depends(get_db)):
    return admin_service.update_user(db, user_id, body.is_active, body.role)


@router.get("/orders", response_model=schemas.OrderPage)
def list_orders(status: str | None = None, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=50), db: Session = Depends(get_db)):
    items, total = order_service.admin_list_orders(db, status, page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/orders/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.admin_get_order(db, order_id)


@router.put("/orders/{order_id}/status", response_model=schemas.OrderOut)
def update_status(order_id: int, body: schemas.StatusUpdateIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return order_service.admin_update_status(db, admin, order_id, body.status)
