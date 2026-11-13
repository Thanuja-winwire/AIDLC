from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, require_admin
from app.core.pagination import PageParams, page_params, paginate
from app.models.user import User
from app.repositories import catalog as repo
from app.schemas.catalog import CategoryIn, CategoryOut, ProductCreate, ProductOut, ProductUpdate
from app.schemas.common import Page
from app.services import catalog as svc

router = APIRouter(tags=["catalog"])


@router.get("/products", response_model=Page[ProductOut])
def list_products(
    q: str | None = None, category_id: int | None = None, active: bool | None = None,
    params: PageParams = Depends(page_params), db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.search_products(q, category_id, active), params)
    return Page(items=svc.to_out(db, rows), total=total, page=params.page, size=params.size)


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(body: ProductCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.to_out(db, [svc.create_product(db, body)])[0]


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return svc.to_out(db, [svc.get_or_404(db, product_id)])[0]


@router.patch("/products/{product_id}", response_model=ProductOut)
@router.put("/products/{product_id}", response_model=ProductOut, include_in_schema=False)
def update_product(product_id: int, body: ProductUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.to_out(db, [svc.update_product(db, product_id, body)])[0]


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return repo.list_categories(db)


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(body: CategoryIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.create_category(db, body)


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, body: CategoryIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.update_category(db, category_id, body)


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    svc.delete_category(db, category_id)
