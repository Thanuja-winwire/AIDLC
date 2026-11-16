"""Invoice PDF rendering (reportlab)."""
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.models import Invoice


def render_invoice_pdf(inv: Invoice) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 60

    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, y, "Invoice")
    c.setFont("Helvetica", 11)
    c.drawRightString(width - 50, y, inv.number or f"#{inv.id}")
    y -= 36

    c.drawString(50, y, f"Billed to: {inv.user.full_name} <{inv.user.email}>")
    y -= 16
    c.drawString(50, y, f"Issued: {inv.issued_at:%Y-%m-%d}")
    y -= 16
    c.drawString(50, y, f"Billing period: {inv.period_start:%Y-%m-%d} to {inv.period_end:%Y-%m-%d}")
    y -= 16
    c.drawString(50, y, f"Status: {inv.status.upper()}")
    y -= 36

    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Description")
    c.drawRightString(width - 50, y, "Amount")
    y -= 6
    c.line(50, y, width - 50, y)
    y -= 18
    c.setFont("Helvetica", 11)
    for line in inv.lines:
        c.drawString(50, y, line.description[:80])
        c.drawRightString(width - 50, y, f"{line.amount:.2f}")
        y -= 16
    y -= 4
    c.line(50, y, width - 50, y)
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Total")
    c.drawRightString(width - 50, y, f"{inv.amount:.2f}")
    y -= 30

    c.setFont("Helvetica", 10)
    c.drawString(50, y, "Payments")
    y -= 14
    for p in inv.payments:
        detail = p.gateway_reference if p.status == "succeeded" else (p.failure_reason or "failed")
        c.drawString(60, y, f"{p.attempted_at:%Y-%m-%d %H:%M} - {p.status} - {p.amount:.2f} - {detail}")
        y -= 14

    c.showPage()
    c.save()
    return buf.getvalue()
