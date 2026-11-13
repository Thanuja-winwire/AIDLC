from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, require_admin
from app.core.pagination import PageParams, page_params, paginate
from app.models.inventory import MovementType
from app.models.user import User
from app.repositories import inventory as repo
from app.schemas.common import Page
from app.schemas.inventory import LocationIn, LocationOut, LocationUpdate, MovementOut, StockLevelOut
from app.services import locations as svc

router = APIRouter(tags=["locations-stock"])


@router.get("/locations", response_model=list[LocationOut])
def list_locations(active: bool | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return repo.list_locations(db, active)


@router.post("/locations", response_model=LocationOut, status_code=201)
def create_location(body: LocationIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.create_location(db, body)


@router.patch("/locations/{location_id}", response_model=LocationOut)
@router.put("/locations/{location_id}", response_model=LocationOut, include_in_schema=False)
def update_location(location_id: int, body: LocationUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return svc.update_location(db, location_id, body)


@router.get("/stock", response_model=Page[StockLevelOut])
def list_stock(
    product_id: int | None = None, location_id: int | None = None, q: str | None = None,
    params: PageParams = Depends(page_params), db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.stock_query(product_id, location_id, q), params)
    return Page(items=svc.stock_rows(rows), total=total, page=params.page, size=params.size)


@router.get("/stock/movements", response_model=Page[MovementOut])
def list_movements(
    product_id: int | None = None, location_id: int | None = None, type: MovementType | None = None,
    params: PageParams = Depends(page_params), db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    rows, total = paginate(db, repo.movement_query(product_id, location_id, type), params)
    return Page(items=svc.movement_rows(rows), total=total, page=params.page, size=params.size)
