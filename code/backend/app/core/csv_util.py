import csv
import io
from typing import Iterable, Sequence

from fastapi.responses import StreamingResponse

_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def _safe(value) -> str:
    """Neutralise spreadsheet formula injection for text cells."""
    if value is None:
        return ""
    if isinstance(value, str) and value.startswith(_FORMULA_PREFIXES):
        return "'" + value
    return str(value)


def csv_response(filename: str, header: Sequence[str], rows: Iterable[Sequence]) -> StreamingResponse:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    for row in rows:
        writer.writerow([_safe(v) for v in row])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
