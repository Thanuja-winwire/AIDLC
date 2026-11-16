"""initial schema

Revision ID: 0001
Revises:
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _dt():
    return sa.DateTime(timezone=True)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False),
        sa.Column("created_at", _dt(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "plans",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("interval", sa.String(10), nullable=False),
        sa.Column("features", sa.JSON, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False),
        sa.Column("created_at", _dt(), nullable=False),
        sa.Column("updated_at", _dt(), nullable=False),
    )

    op.create_table(
        "payment_methods",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("brand", sa.String(20), nullable=False),
        sa.Column("last4", sa.String(4), nullable=False),
        sa.Column("gateway_token", sa.String(100), nullable=False),
        sa.Column("created_at", _dt(), nullable=False),
        sa.Column("updated_at", _dt(), nullable=False),
    )

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("plan_id", sa.Integer, sa.ForeignKey("plans.id"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("current_period_start", _dt(), nullable=False),
        sa.Column("current_period_end", _dt(), nullable=False),
        sa.Column("cancel_at_period_end", sa.Boolean, nullable=False),
        sa.Column("cancelled_at", _dt(), nullable=True),
        sa.Column("renewal_attempts", sa.Integer, nullable=False),
        sa.Column("price_at_subscription", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", _dt(), nullable=False),
        sa.Column("updated_at", _dt(), nullable=False),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])
    op.create_index(
        "uq_one_live_subscription_per_user",
        "subscriptions",
        ["user_id"],
        unique=True,
        postgresql_where=sa.text("status IN ('active', 'past_due')"),
        sqlite_where=sa.text("status IN ('active', 'past_due')"),
    )

    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("number", sa.String(20), nullable=True, unique=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("subscription_id", sa.Integer, sa.ForeignKey("subscriptions.id"), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(10), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("period_start", _dt(), nullable=False),
        sa.Column("period_end", _dt(), nullable=False),
        sa.Column("issued_at", _dt(), nullable=False),
        sa.Column("paid_at", _dt(), nullable=True),
    )
    op.create_index("ix_invoices_user_id", "invoices", ["user_id"])
    op.create_index("ix_invoices_subscription_id", "invoices", ["subscription_id"])

    op.create_table(
        "invoice_lines",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("invoice_id", sa.Integer, sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("description", sa.String(300), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
    )
    op.create_index("ix_invoice_lines_invoice_id", "invoice_lines", ["invoice_id"])

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("invoice_id", sa.Integer, sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(10), nullable=False),
        sa.Column("gateway_reference", sa.String(60), nullable=True),
        sa.Column("failure_reason", sa.String(100), nullable=True),
        sa.Column("attempted_at", _dt(), nullable=False),
    )
    op.create_index("ix_payments_invoice_id", "payments", ["invoice_id"])
    op.create_index("ix_payments_user_id", "payments", ["user_id"])


def downgrade() -> None:
    for table in ("payments", "invoice_lines", "invoices", "subscriptions", "payment_methods", "plans", "users"):
        op.drop_table(table)
