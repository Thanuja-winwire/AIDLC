"""ChromaDB-backed chunk store. Documents are derived by aggregating chunk metadata."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.errors import AppError, UpstreamError
from app.core.models import DocumentInfo, RetrievedChunk

_NO_PAGE = -1  # Chroma metadata cannot hold None


class VectorStore:
    def __init__(self, path: str, collection_name: str = "documents"):
        try:
            self._client = chromadb.PersistentClient(
                path=path, settings=ChromaSettings(anonymized_telemetry=False)
            )
            self._collection = self._client.get_or_create_collection(
                name=collection_name, metadata={"hnsw:space": "cosine"}
            )
        except Exception as exc:
            raise UpstreamError("The vector store could not be opened.") from exc

    @staticmethod
    def _guard(exc: Exception) -> AppError:
        return exc if isinstance(exc, AppError) else UpstreamError("The vector store failed.")

    def count(self) -> int:
        try:
            return self._collection.count()
        except Exception as exc:
            raise self._guard(exc) from exc

    def add(
        self,
        doc_id: str,
        filename: str,
        chunks: list[str],
        embeddings: list[list[float]],
        pages: Optional[list[Optional[int]]] = None,
        uploaded_at: Optional[str] = None,
    ) -> None:
        if not chunks:
            return
        if len(chunks) != len(embeddings):
            raise ValueError("chunks and embeddings must be the same length")
        pages = pages or [None] * len(chunks)
        stamp = uploaded_at or datetime.now(timezone.utc).isoformat()
        try:
            self._collection.add(
                ids=[f"{doc_id}:{i}" for i in range(len(chunks))],
                documents=chunks,
                embeddings=embeddings,
                metadatas=[
                    {
                        "document_id": doc_id,
                        "filename": filename,
                        "chunk_index": i,
                        "page": pages[i] if pages[i] is not None else _NO_PAGE,
                        "uploaded_at": stamp,
                    }
                    for i in range(len(chunks))
                ],
            )
        except Exception as exc:
            raise self._guard(exc) from exc

    def query(self, embedding: list[float], k: int) -> list[RetrievedChunk]:
        try:
            total = self._collection.count()
            if total == 0:
                return []
            result = self._collection.query(
                query_embeddings=[embedding],
                n_results=min(k, total),
                include=["documents", "metadatas", "distances"],
            )
        except Exception as exc:
            raise self._guard(exc) from exc
        chunks: list[RetrievedChunk] = []
        for text, meta, dist in zip(
            result["documents"][0], result["metadatas"][0], result["distances"][0]
        ):
            page = meta.get("page", _NO_PAGE)
            chunks.append(
                RetrievedChunk(
                    document_id=meta["document_id"],
                    filename=meta["filename"],
                    chunk_index=int(meta["chunk_index"]),
                    page=None if page == _NO_PAGE else int(page),
                    text=text,
                    score=round(1.0 - float(dist), 4),
                )
            )
        return chunks

    def list_documents(self) -> list[DocumentInfo]:
        try:
            data = self._collection.get(include=["metadatas"])
        except Exception as exc:
            raise self._guard(exc) from exc
        docs: dict[str, DocumentInfo] = {}
        for meta in data["metadatas"] or []:
            doc_id = meta["document_id"]
            if doc_id in docs:
                docs[doc_id].chunk_count += 1
            else:
                docs[doc_id] = DocumentInfo(
                    id=doc_id,
                    filename=meta["filename"],
                    chunk_count=1,
                    uploaded_at=meta["uploaded_at"],
                )
        return sorted(docs.values(), key=lambda d: d.uploaded_at, reverse=True)

    def delete(self, doc_id: str) -> bool:
        try:
            found = self._collection.get(where={"document_id": doc_id}, include=[])
            ids = found["ids"]
            if not ids:
                return False
            self._collection.delete(ids=ids)
            return True
        except Exception as exc:
            raise self._guard(exc) from exc
