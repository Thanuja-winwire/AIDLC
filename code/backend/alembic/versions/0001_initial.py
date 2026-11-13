"""initial schema

Creates all tables, constraints and the PO/SO/TR number sequences from the
model metadata. Later schema changes must be added as explicit migrations.
"""
from alembic import op

import app.models  # noqa: F401
from app.core.db import Base

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
