from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.models import Cart, CartItem, Product, User

TAX_RATE = Decimal("0.08")
CENT = Decimal("0.01")


def calc_tax(subtotal: Decimal) -> Decimal:
    return (subtotal * TAX_RATE).quantize(CENT, rounding=ROUND_HALF_UP)


def get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
    return cart


def build_cart_view(cart: Cart) -> dict:
    items = []
    subtotal = Decimal("0.00")
    count = 0
    for it in cart.items:
        unavailable = not it.product.is_active
        line = (it.product.price * it.quantity).quantize(CENT)
        if not unavailable:
            subtotal += line
            count += it.quantity
        items.append(
            {"id": it.id, "product": it.product, "quantity": it.quantity, "line_total": line, "unavailable": unavailable}
        )
    tax = calc_tax(subtotal)
    return {
        "items": items,
        "subtotal": subtotal,
        "shipping": Decimal("0.00"),
        "tax": tax,
        "total": subtotal + tax,
        "count": count,
    }


def get_cart(db: Session, user: User) -> dict:
    return build_cart_view(get_or_create_cart(db, user))


def add_item(db: Session, user: User, product_id: int, qty: int) -> dict:
    cart = get_or_create_cart(db, user)
    product = db.get(Product, product_id)
    if not product or not product.is_active:
        raise DomainError(404, "Product not found")
    existing = next((i for i in cart.items if i.product_id == product_id), None)
    new_qty = (existing.quantity if existing else 0) + qty
    if new_qty > product.stock:
        raise DomainError(409, f"Only {product.stock} in stock")
    if new_qty > 99:
        raise DomainError(422, "Quantity cannot exceed 99")
    if existing:
        existing.quantity = new_qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=qty))
    db.commit()
    db.refresh(cart)
    return build_cart_view(cart)


def _own_item(db: Session, cart: Cart, item_id: int) -> CartItem:
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise DomainError(404, "Cart item not found")
    return item


def update_item(db: Session, user: User, item_id: int, qty: int) -> dict:
    cart = get_or_create_cart(db, user)
    item = _own_item(db, cart, item_id)
    if qty > item.product.stock:
        raise DomainError(409, f"Only {item.product.stock} in stock")
    item.quantity = qty
    db.commit()
    db.refresh(cart)
    return build_cart_view(cart)


def remove_item(db: Session, user: User, item_id: int) -> dict:
    cart = get_or_create_cart(db, user)
    item = _own_item(db, cart, item_id)
    cart.items.remove(item)
    db.commit()
    db.refresh(cart)
    return build_cart_view(cart)


def clear(db: Session, user: User) -> dict:
    cart = get_or_create_cart(db, user)
    cart.items.clear()
    db.commit()
    db.refresh(cart)
    return build_cart_view(cart)
