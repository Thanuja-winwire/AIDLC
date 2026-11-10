from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.models import Order, OrderItem, OrderStatusEvent, Payment, Product, User
from app.services.cart_service import calc_tax, get_or_create_cart
from app.services.payment_gateway import get_gateway

CENT = Decimal("0.01")
CUSTOMER_CANCELLABLE = {"pending", "paid", "processing", "payment_failed"}
ADMIN_FORWARD = {"paid": "processing", "processing": "shipped", "shipped": "delivered"}


def _event(db: Session, order: Order, status: str, actor_id: int | None):
    order.status = status
    db.add(OrderStatusEvent(order_id=order.id, status=status, actor_user_id=actor_id))


def place_order(db: Session, user: User, address: dict) -> Order:
    cart = get_or_create_cart(db, user)
    if not cart.items:
        raise DomainError(409, "Cart is empty")
    if any(not i.product.is_active for i in cart.items):
        raise DomainError(409, "Cart contains unavailable items; remove them to continue")
    try:
        ids = sorted(i.product_id for i in cart.items)
        locked = {
            p.id: p
            for p in db.scalars(
                select(Product).where(Product.id.in_(ids)).order_by(Product.id).with_for_update()
            ).unique()
        }
        short = [locked[i.product_id].name for i in cart.items if locked[i.product_id].stock < i.quantity]
        if short:
            raise DomainError(409, "Insufficient stock for: " + ", ".join(short))
        subtotal = Decimal("0.00")
        lines = []
        for i in cart.items:
            p = locked[i.product_id]
            p.stock -= i.quantity
            line = (p.price * i.quantity).quantize(CENT)
            subtotal += line
            lines.append((p, i.quantity, line))
        tax = calc_tax(subtotal)
        order = Order(
            user_id=user.id,
            status="pending",
            subtotal=subtotal,
            shipping=Decimal("0.00"),
            tax=tax,
            total=subtotal + tax,
            ship_full_name=address["full_name"],
            ship_line1=address["line1"],
            ship_line2=address.get("line2"),
            ship_city=address["city"],
            ship_state=address["state"],
            ship_postal_code=address["postal_code"],
            ship_country=address["country"],
            ship_phone=address.get("phone"),
        )
        db.add(order)
        db.flush()
        for p, qty, line in lines:
            db.add(
                OrderItem(
                    order_id=order.id, product_id=p.id, product_name=p.name,
                    unit_price=p.price, quantity=qty, line_total=line,
                )
            )
        db.add(OrderStatusEvent(order_id=order.id, status="pending", actor_user_id=user.id))
        cart.items.clear()
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(order)
    return order


def pay(db: Session, user: User, order_id: int, card_number: str) -> tuple[Order, bool, str]:
    order = get_own_order(db, user, order_id)
    if order.status not in ("pending", "payment_failed"):
        raise DomainError(409, f"Order in status '{order.status}' cannot be paid")
    result = get_gateway().charge(order.total, card_number, f"order-{order.id}")
    db.add(
        Payment(
            order_id=order.id, amount=order.total,
            status="success" if result.success else "failed",
            reference=result.reference, card_last4=card_number[-4:], failure_reason=result.reason,
        )
    )
    db.flush()
    _event(db, order, "paid" if result.success else "payment_failed", user.id)
    db.commit()
    db.refresh(order)
    return order, result.success, "Payment successful" if result.success else (result.reason or "Payment failed")


def get_own_order(db: Session, user: User, order_id: int) -> Order:
    order = db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise DomainError(404, "Order not found")
    return order


def list_orders(db: Session, user: User, page: int, page_size: int):
    base = select(Order).where(Order.user_id == user.id)
    total = db.scalar(select(func.count()).select_from(base.subquery()))
    items = db.scalars(
        base.order_by(Order.created_at.desc(), Order.id.desc()).offset((page - 1) * page_size).limit(page_size)
    ).unique().all()
    return items, total


def _cancel(db: Session, order: Order, actor_id: int):
    for it in order.items:
        product = db.get(Product, it.product_id)
        if product:
            product.stock += it.quantity
    for pay_rec in order.payments:
        if pay_rec.status == "success":
            pay_rec.status = "refunded"
    _event(db, order, "cancelled", actor_id)


def cancel_order(db: Session, user: User, order_id: int) -> Order:
    order = get_own_order(db, user, order_id)
    if order.status not in CUSTOMER_CANCELLABLE:
        raise DomainError(409, f"Order in status '{order.status}' cannot be cancelled")
    _cancel(db, order, user.id)
    db.commit()
    db.refresh(order)
    return order


# ----- admin -----
def admin_list_orders(db: Session, status: str | None, page: int, page_size: int):
    base = select(Order)
    if status:
        base = base.where(Order.status == status)
    total = db.scalar(select(func.count()).select_from(base.subquery()))
    items = db.scalars(
        base.order_by(Order.created_at.desc(), Order.id.desc()).offset((page - 1) * page_size).limit(page_size)
    ).unique().all()
    return items, total


def admin_get_order(db: Session, order_id: int) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise DomainError(404, "Order not found")
    return order


def admin_update_status(db: Session, admin: User, order_id: int, new_status: str) -> Order:
    order = admin_get_order(db, order_id)
    if new_status == "cancelled":
        if order.status in ("delivered", "cancelled"):
            raise DomainError(409, f"Order in status '{order.status}' cannot be cancelled")
        _cancel(db, order, admin.id)
    else:
        if ADMIN_FORWARD.get(order.status) != new_status:
            raise DomainError(409, f"Cannot move order from '{order.status}' to '{new_status}'")
        _event(db, order, new_status, admin.id)
    db.commit()
    db.refresh(order)
    return order
