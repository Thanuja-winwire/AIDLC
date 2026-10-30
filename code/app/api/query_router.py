"""Question answering endpoint (literal path: /api/query)."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_query
from app.core.models import Answer, QueryRequest
from app.services.query import QueryService

router = APIRouter(prefix="/api", tags=["query"])


@router.post("/query", response_model=Answer)
def query(body: QueryRequest, service: QueryService = Depends(get_query)):
    return service.answer(body.question)
