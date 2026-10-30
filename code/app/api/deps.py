"""FastAPI dependencies: services are created once in the app factory and kept on app.state."""
from __future__ import annotations

from fastapi import Request

from app.services.ingestion import IngestionService
from app.services.query import QueryService


def get_ingestion(request: Request) -> IngestionService:
    return request.app.state.ingestion


def get_query(request: Request) -> QueryService:
    return request.app.state.query
