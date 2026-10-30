"""Text extraction for PDF, TXT and Markdown files."""
from __future__ import annotations

import io
import os
from typing import Optional

from pypdf import PdfReader

from app.core.errors import EmptyDocument, UnsupportedFileType

ALLOWED_EXTENSIONS = (".pdf", ".txt", ".md")

# (page number, text). Page is 1-based for PDFs and None for plain text.
Page = tuple[Optional[int], str]


def sanitize_filename(filename: str) -> str:
    """Basename only, no path components (R-FILE-3)."""
    name = (filename or "").replace("\\", "/").split("/")[-1].strip()
    return name


def extension_of(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()


def validate_extension(filename: str) -> str:
    ext = extension_of(filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise UnsupportedFileType(
            f"Unsupported file type '{ext or filename}'. Allowed: PDF, TXT, Markdown."
        )
    return ext


def _decode(data: bytes) -> str:
    try:
        return data.decode("utf-8-sig")
    except UnicodeDecodeError:
        return data.decode("latin-1")


def _pdf_pages(data: bytes) -> list[Page]:
    try:
        reader = PdfReader(io.BytesIO(data))
        pages: list[Page] = []
        for number, page in enumerate(reader.pages, start=1):
            pages.append((number, page.extract_text() or ""))
        return pages
    except Exception as exc:  # pypdf raises many different errors for corrupt files
        raise EmptyDocument("The PDF could not be read. It may be corrupt or encrypted.") from exc


def extract_pages(filename: str, data: bytes) -> list[Page]:
    """Return non-empty (page, text) pairs. Raises UnsupportedFileType / EmptyDocument."""
    ext = validate_extension(filename)
    raw: list[Page] = _pdf_pages(data) if ext == ".pdf" else [(None, _decode(data))]
    pages = [(num, text) for num, text in raw if text.strip()]
    if not pages:
        raise EmptyDocument("No extractable text found in this file.")
    return pages


def extract_text(filename: str, data: bytes) -> str:
    return "\n\n".join(text for _, text in extract_pages(filename, data))
