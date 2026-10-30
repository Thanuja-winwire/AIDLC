import pytest

from app.core.errors import (
    DocumentNotFound,
    EmptyDocument,
    FileTooLarge,
    UnsupportedFileType,
    UpstreamError,
)
from app.services.ingestion import IngestionService
from tests.conftest import make_pdf


@pytest.fixture
def service(settings, store, embedder, chunker):
    return IngestionService(settings, store, embedder, chunker)


def test_ingest_text_and_list(service):
    info = service.ingest("notes.txt", b"Cats purr. " * 60)
    assert info.filename == "notes.txt" and info.chunk_count > 1 and not info.replaced
    assert [d.id for d in service.list_documents()] == [info.id]


def test_ingest_markdown_and_pdf(service):
    assert service.ingest("a.md", b"# Title\n\nSome body text.").chunk_count == 1
    assert service.ingest("b.pdf", make_pdf("Hello from a pdf")).chunk_count == 1


def test_reupload_replaces(service, store):
    first = service.ingest("a.txt", b"alpha " * 100)
    second = service.ingest("a.txt", b"beta")
    assert second.id == first.id and second.replaced
    docs = service.list_documents()
    assert len(docs) == 1 and docs[0].chunk_count == 1


def test_rejects_unsupported_type(service):
    with pytest.raises(UnsupportedFileType):
        service.ingest("x.exe", b"data")


def test_rejects_empty_text(service, store):
    with pytest.raises(EmptyDocument):
        service.ingest("blank.txt", b"   \n  ")
    assert store.count() == 0


def test_rejects_too_large(service):
    with pytest.raises(FileTooLarge):
        service.ingest("big.txt", b"a" * (1024 * 1024 + 1))


def test_filename_is_sanitised(service):
    assert service.ingest("../../etc/notes.txt", b"hello").filename == "notes.txt"


def test_embedding_failure_keeps_old_version(service, embedder, store):
    service.ingest("a.txt", b"original content")
    embedder.fail = True
    with pytest.raises(UpstreamError):
        service.ingest("a.txt", b"new content")
    assert service.list_documents()[0].chunk_count == 1
    assert store.count() == 1


def test_embedding_failure_leaves_nothing_for_new_doc(service, embedder, store):
    embedder.fail = True
    with pytest.raises(UpstreamError):
        service.ingest("a.txt", b"content")
    assert store.count() == 0


def test_delete(service):
    info = service.ingest("a.txt", b"hello")
    assert service.delete_document(info.id) is True
    assert service.list_documents() == []
    with pytest.raises(DocumentNotFound):
        service.delete_document(info.id)
