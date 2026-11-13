from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, ValidationFailed
from app.models.inventory import MovementType
from app.models.sales import Sale, SaleLine
from app.models.user import User
from app.repositories import sales as repo
from app.schemas.sales import SaleCreate, SaleLineOut, SaleOut
from app.services import catalog as catalog_svc
from app.services import locations as locations_svc
from app.services.numbering import next_number
from app.services.stock_ledger import StockLedger

CENT = Decimal("0.01")


def to_out(sale: Sale) -> SaleOut:
    return SaleOut(
        id=sale.id, number=sale.number, location_id=sale.location_id, location_name=sale.location.name,
        customer_name=sale.customer_name, total_amount=sale.total_amount, created_by=sale.created_by,
        sold_at=sale.sold_at,
        lines=[
            SaleLineOut(
                id=l.id, product_id=l.product_id, product_sku=l.product.sku, product_name=l.product.name,
                quantity=l.quantity, unit_price=l.unit_price, line_total=l.line_total,
            )
            for l in sale.lines
        ],
    )


def get_or_404(db: Session, sale_id: int) -> Sale:
    sale = repo.get_sale(db, sale_id)
    if sale is None:
        raise NotFoundError("Sale not found")
    return sale


def create_sale(db: Session, user: User, data: SaleCreate) -> Sale:
    locations_svc.require_active_location(db, data.location_id)
    seen: set[int] = set()
    for line in data.lines:
        if line.product_id in seen:
            raise ValidationFailed("Duplicate product in sale lines")
        seen.add(line.product_id)
    sale = Sale(
        number=next_number(db, "SO"), location_id=data.location_id, customer_name=data.customer_name,
        created_by=user.id, total_amount=Decimal("0"),
    )
    total = Decimal("0")
    products = []
    for line in data.lines:
        product = catalog_svc.require_active_product(db, line.product_id)
        price = Decimal(line.unit_price if line.unit_price is not None else product.sale_price)
        line_total = (price * line.quantity).quantize(CENT)
        total += line_total
        sale.lines.append(
            SaleLine(
                product_id=product.id, quantity=line.quantity, unit_price=price,
                unit_cost_snapshot=product.unit_cost, line_total=line_total,
            )
        )
        products.append(product)
    sale.total_amount = total
    db.add(sale)
    db.flush()
    ledger = StockLedger(db, user.id)
    # Check every line first so the error can name all offending products (BR-SA4).
    short = []
    for line, product in zip(data.lines, products):
        available = ledger.current_quantity(product.id, data.location_id)
        if available < line.quantity:
            short.append(f"{product.sku} (available {available}, requested {line.quantity})")
    if short:
        from app.core.errors import InsufficientStockError
        raise InsufficientStockError("Insufficient stock for: " + ", ".join(short))
    for line, product in zip(data.lines, products):
        ledger.apply(
            product_id=product.id, location_id=data.location_id, delta=-line.quantity,
            movement_type=MovementType.SALE, reference_type="SALE", reference_id=sale.id, note=sale.number,
        )
    return sale
