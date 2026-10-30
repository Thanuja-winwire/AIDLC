"""Document management endpoints (paths are literal: /api/documents)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, Response, UploadFile

from app.api.deps import get_ingestion
from app.core.errors import UnsupportedFileType
from app.core.models import DocumentInfo
from app.services.ingestion import IngestionService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("", status_code=201, response_model=list[DocumentInfo])
def upload_documents(
    files: list[UploadFile] = File(...),
    service: IngestionService = Depends(get_ingestion),
):
    if not files:
        raise UnsupportedFileType("No files were uploaded.")
    # Files are processed in order; the first failure aborts the request with its error.
    return [service.ingest(f.filename or "", f.file.read()) for f in files]


@router.get("", response_model=list[DocumentInfo])
def list_documents(service: IngestionService = Depends(get_ingestion)):
    return service.list_documents()


@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: str, service: IngestionService = Depends(get_ingestion)):
    service.delete_document(doc_id)
    return Response(status_code=204)
