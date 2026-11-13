import csv
import io
from typing import Iterable, Iterator, Sequence


def _sanitize(value: object) -> object:
    # Neutralize spreadsheet formula injection
    if isinstance(value, str) and value[:1] in ("=", "+", "-", "@"):
        return "'" + value
    return value


def rows_to_csv(header: Sequence[str], rows: Iterable[Sequence[object]]) -> Iterator[str]:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    yield buffer.getvalue()
    for row in rows:
        buffer.seek(0)
        buffer.truncate(0)
        writer.writerow([_sanitize(v) for v in row])
        yield buffer.getvalue()
