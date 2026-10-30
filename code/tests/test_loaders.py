import pytest
from pypdf import PdfWriter
import io

from app.core import loaders
from app.core.errors import EmptyDocument, UnsupportedFileType
from tests.conftest import make_pdf


def test_txt_is_decoded():
    assert loaders.extract_text("a.txt", b"hello there") == "hello there"


def test_markdown_is_supported():
    pages = loaders.extract_pages("notes.MD", b"# Title\n\nbody")
    assert pages == [(None, "# Title\n\nbody")]


def test_latin1_fallback():
    text = loaders.extract_text("a.txt", "café".encode("latin-1"))
    assert text == "café"


def test_unsupported_extension_rejected():
    with pytest.raises(UnsupportedFileType):
        loaders.extract_text("a.docx", b"x")


def test_blank_text_rejected():
    with pytest.raises(EmptyDocument):
        loaders.extract_text("a.txt", b"  \n ")


def test_pdf_text_is_extracted_with_page_number():
    pages = loaders.extract_pages("doc.pdf", make_pdf("Quarterly revenue grew"))
    assert pages[0][0] == 1
    assert "Quarterly revenue grew" in pages[0][1]


def test_pdf_without_text_rejected():
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    buf = io.BytesIO()
    writer.write(buf)
    with pytest.raises(EmptyDocument):
        loaders.extract_pages("scan.pdf", buf.getvalue())


def test_corrupt_pdf_rejected():
    with pytest.raises(EmptyDocument):
        loaders.extract_pages("bad.pdf", b"not a pdf")


def test_sanitize_filename_strips_paths():
    assert loaders.sanitize_filename("../../etc/passwd.txt") == "passwd.txt"
    assert loaders.sanitize_filename("C:\\docs\\a.pdf") == "a.pdf"
