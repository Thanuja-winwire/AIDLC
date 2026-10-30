"""App factory. Serves the API and the static UI from one process on one port (no CORS/proxy)."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api import documents_router, health_router, query_router
from app.core.chunker import Chunker
from app.core.errors import AppError
from app.core.settings import Settings
from app.core.vector_store import VectorStore
from app.services.ingestion import IngestionService
from app.services.query import QueryService

STATIC_DIR = Path(__file__).parent / "static"


def create_app(
    settings: Optional[Settings] = None,
    store: Optional[VectorStore] = None,
    embedder=None,
    llm=None,
) -> FastAPI:
    """Build the app. Pass `embedder`/`llm`/`store` to inject fakes (tests); otherwise OpenAI is used."""
    settings = settings or Settings.load()
    if embedder is None or llm is None:
        settings.require_api_key()  # R-CFG-1: fail fast with a clear message
        import openai

        from app.core.embeddings import EmbeddingClient
        from app.core.llm import LLMClient

        client = openai.OpenAI(api_key=settings.openai_api_key)
        embedder = embedder or EmbeddingClient(client, settings.embedding_model, settings.embed_batch_size)
        llm = llm or LLMClient(client, settings.chat_model, settings.temperature)

    store = store or VectorStore(settings.chroma_dir)
    chunker = Chunker(settings.chunk_size, settings.chunk_overlap)

    app = FastAPI(title="RAG App")
    app.state.ingestion = IngestionService(settings, store, embedder, chunker)
    app.state.query = QueryService(settings, store, embedder, llm)

    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    app.include_router(health_router.router)
    app.include_router(documents_router.router)
    app.include_router(query_router.router)

    if STATIC_DIR.is_dir():
        app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

        @app.get("/", include_in_schema=False)
        def index():
            return FileResponse(STATIC_DIR / "index.html")

    return app


def app_factory() -> FastAPI:
    """Entry point for uvicorn: `uvicorn app.main:app_factory --factory`."""
    return create_app()
