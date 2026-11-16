from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_customer
from app.gateway import SimulatedGateway, get_gateway
from app.models import User
from app.schemas import InvoiceOut, Page, PaymentMethodIn, PaymentMethodOut, PaymentOut
from app.services import billing_service, pdf

router = APIRouter(tags=["billing"])


@router.get("/invoices", response_model=Page[InvoiceOut])
def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return billing_service.list_invoices(db, user_id=user.id, page=page, page_size=page_size)


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return billing_service.invoice_out(billing_service.get_invoice(db, invoice_id, user))


@router.get("/invoices/{invoice_id}/pdf")
def invoice_pdf(invoice_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inv = billing_service.get_invoice(db, invoice_id, user)
    return Response(
        content=pdf.render_invoice_pdf(inv),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{inv.number or inv.id}.pdf"'},
    )


@router.get("/payments", response_model=Page[PaymentOut])
def list_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return billing_service.list_payments(db, user_id=user.id, page=page, page_size=page_size)


@router.get("/payment-method", response_model=PaymentMethodOut | None)
def get_payment_method(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return billing_service.get_payment_method(db, user.id)


@router.put("/payment-method", response_model=PaymentMethodOut)
def put_payment_method(
    data: PaymentMethodIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_customer),
    gateway: SimulatedGateway = Depends(get_gateway),
):
    pm = billing_service.set_payment_method(db, user, data.card, gateway)
    db.commit()
    return pm
