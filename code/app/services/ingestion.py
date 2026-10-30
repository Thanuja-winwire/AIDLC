"""Document ingestion: validate -> extract -> chunk -> embed -> store (replace semantics)."""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from app.core.chunker import Chunker
from app.core.errors import DocumentNotFound, EmptyDocument, FileTooLarge, UnsupportedFileType
from app.core.loaders import extract_pages, sanitize_filename, validate_extension
from app.core.models import DocumentInfo
from app.core.settings import Settings
from app.core.vector_store import VectorStore


def document_id_for(filename: str) -> str:
    """Same filename -> same id (R-DUP-1)."""
    return hashlib.sha1(filename.encode("utf-8")).hexdigest()[:16]


class IngestionService:
    def __init__(self, settings: Settings, store: VectorStore, embedder, chunker: Chunker):
        self._settings = settings
        self._store = store
        self._embedder = embedder
        self._chunker = chunker

    def ingest(self, filename: str, data: bytes) -> DocumentInfo:
        name = sanitize_filename(filename)
        if not name:
            raise UnsupportedFileType("The file has no name.")
        validate_extension(name)
        if len(data) > self._settings.max_upload_bytes:
            raise FileTooLarge(f"'{name}' exceeds the {self._settings.max_upload_mb} MB limit.")

        pages = extract_pages(name, data)  # raises EmptyDocument

        chunks: list[str] = []
        chunk_pages: list = []
        for page_number, text in pages:
            for piece in self._chunker.split(text):
                chunks.append(piece)
                chunk_pages.append(page_number)
        if not chunks:
            raise EmptyDocument("No extractable text found in this file.")

        # Embed first: if this fails the previous version (if any) is left untouched.
        embeddings = self._embedder.embed(chunks)

        doc_id = document_id_for(name)
        replaced = self._store.delete(doc_id)
        stamp = datetime.now(timezone.utc).isoformat()
        try:
            self._store.add(doc_id, name, chunks, embeddings, pages=chunk_pages, uploaded_at=stamp)
        except Exception:
            self._store.delete(doc_id)  # R-ERR-2: never leave partial vectors
            raise
        return DocumentInfo(
            id=doc_id, filename=name, chunk_count=len(chunks), uploaded_at=stamp, replaced=replaced
        )

    def list_documents(self) -> list[DocumentInfo]:
        return self._store.list_documents()

    def delete_document(self, doc_id: str) -> bool:
        if not self._store.delete(doc_id):
            raise DocumentNotFound("Document not found.")
        return True
