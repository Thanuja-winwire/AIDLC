from decimal import Decimal

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app import schemas
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.services import cart_service, catalog_auth, order_service

router = APIRouter()


# ---- auth ----
@router.post("/auth/register", response_model=schemas.TokenOut, status_code=201)
def register(body: schemas.RegisterIn, db: Session = Depends(get_db)):
    user = catalog_auth.register(db, body.email, body.password, body.name)
    token, user = catalog_auth.login(db, body.email, body.password)
    return {"access_token": token, "user": user}


@router.post("/auth/login", response_model=schemas.TokenOut)
def login(body: schemas.LoginIn, db: Session = Depends(get_db)):
    token, user = catalog_auth.login(db, body.email, body.password)
    return {"access_token": token, "user": user}


@router.get("/auth/me", response_model=schemas.UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.put("/auth/me", response_model=schemas.UserOut)
def update_me(body: schemas.ProfileUpdateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return catalog_auth.update_profile(db, user, body.name, body.current_password, body.new_password)


# ---- catalog ----
@router.get("/products", response_model=schemas.ProductPage)
def products(
    q: str | None = None,
    category_id: int | None = None,
    min_price: Decimal | None = Query(None, ge=0),
    max_price: Decimal | None = Query(None, ge=0),
    in_stock: bool = False,
    sort: str = "newest",
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    items, total = catalog_auth.list_products(db, q, category_id, min_price, max_price, in_stock, sort, page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/products/{product_id}", response_model=schemas.ProductOut)
def product(product_id: int, db: Session = Depends(get_db)):
    return catalog_auth.get_product(db, product_id)


@router.get("/categories", response_model=list[schemas.CategoryOut])
def categories(db: Session = Depends(get_db)):
    return catalog_auth.list_categories(db)


# ---- cart ----
@router.get("/cart", response_model=schemas.CartOut)
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cart_service.get_cart(db, user)


@router.post("/cart/items", response_model=schemas.CartOut)
def add_item(body: schemas.CartItemIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cart_service.add_item(db, user, body.product_id, body.quantity)


@router.put("/cart/items/{item_id}", response_model=schemas.CartOut)
def update_item(item_id: int, body: schemas.CartItemUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cart_service.update_item(db, user, item_id, body.quantity)


@router.delete("/cart/items/{item_id}", response_model=schemas.CartOut)
def remove_item(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cart_service.remove_item(db, user, item_id)


@router.delete("/cart", response_model=schemas.CartOut)
def clear_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cart_service.clear(db, user)


# ---- orders ----
@router.post("/orders", response_model=schemas.CheckoutOut, status_code=201)
def checkout(body: schemas.CheckoutIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = order_service.place_order(db, user, body.address.model_dump())
    order, ok, msg = order_service.pay(db, user, order.id, body.card.number)
    return {"order": order, "payment_success": ok, "message": msg}


@router.get("/orders", response_model=schemas.OrderPage)
def list_orders(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=50), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items, total = order_service.list_orders(db, user, page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/orders/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return order_service.get_own_order(db, user, order_id)


@router.post("/orders/{order_id}/cancel", response_model=schemas.OrderOut)
def cancel(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return order_service.cancel_order(db, user, order_id)


@router.post("/orders/{order_id}/pay", response_model=schemas.CheckoutOut)
def pay(order_id: int, body: schemas.PayIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order, ok, msg = order_service.pay(db, user, order_id, body.card.number)
    return {"order": order, "payment_success": ok, "message": msg}
