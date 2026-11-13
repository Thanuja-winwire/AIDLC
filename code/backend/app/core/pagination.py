from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session


def paginate(session: Session, stmt: Select, page: int, size: int) -> tuple[list[Any], int]:
    """Returns (rows, total). `page` is 1-based. Rows are scalars for single-entity selects."""
    page = max(page, 1)
    size = min(max(size, 1), 200)
    total = session.execute(select(func.count()).select_from(stmt.order_by(None).subquery())).scalar_one()
    result = session.execute(stmt.limit(size).offset((page - 1) * size))
    rows = result.all()
    if rows and len(rows[0]) == 1:
        return [r[0] for r in rows], total
    return rows, total
