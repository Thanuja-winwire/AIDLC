"""initial schema

Creates every table from the current model metadata and the PO/SO/TR number
sequences. This is the baseline revision; later changes must be explicit revisions.
"""
from alembic import op

import app.models  # noqa: F401
from app.core.db import Base

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

SEQUENCES = ("po_number_seq", "so_number_seq", "tr_number_seq")


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)
    if bind.dialect.name == "postgresql":
        for seq in SEQUENCES:
            op.execute(f"CREATE SEQUENCE IF NOT EXISTS {seq} START 1")


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
    if bind.dialect.name == "postgresql":
        for seq in SEQUENCES:
            op.execute(f"DROP SEQUENCE IF EXISTS {seq}")
