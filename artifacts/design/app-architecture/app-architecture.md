# Application Architecture (Consolidated)

Source: specs.md and the approved app-architecture-plan.md. Single unit: one FastAPI app serving the API and a static UI.

## Decisions
- Layered modules in one package: `api` -> `services` -> `core`
- Synchronous ingestion within the upload request
- Static HTML/CSS/JS served by FastAPI, no build step
- OpenAI for embeddings and chat; Chroma persistent local store

## Package layout
```
app/
  main.py          # app factory, router wiring, static mount
  api/             # documents_router, query_router, health_router
  services/        # IngestionService, QueryService
  core/            # settings, loaders, chunker, embeddings, llm, vector_store
  static/          # index.html, styles.css, app.js
tests/             # unit tests with OpenAI mocked
```

## Components
- **API**: documents, query and health routers, plus static UI
- **Services**: IngestionService, QueryService
- **Core**: Settings, loaders, Chunker, EmbeddingClient, LLMClient, VectorStore

## Method summary
- `IngestionService.ingest(filename, data) -> DocumentInfo`; `list_documents()`; `delete_document(id)`
- `QueryService.answer(question) -> Answer(answer, sources)`
- `VectorStore.add / query / list_documents / delete`

## Services and flow
- Ingestion: extract text -> chunk -> embed -> store -> return DocumentInfo
- Query: embed question -> top-k retrieval -> prompt LLM with context -> answer plus cited sources; says so when context is insufficient

## Dependencies
Downward only (api -> services -> core). Services are built at startup and injected through FastAPI dependencies, so OpenAI clients can be mocked in tests.

## Endpoints
`POST /api/documents`, `GET /api/documents`, `DELETE /api/documents/{id}`, `POST /api/query`, `GET /health`, `/` (UI).

Details: components.md, component-methods.md, services.md, component-dependency.md.
