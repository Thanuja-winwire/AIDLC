# Code Generation Plan: RAG App (single unit)

Sources: specs.md, app-architecture.md, business-logic-model.md, business-rules.md, domain-entities.md, frontend-components.md.
Stories: none (User Stories stage skipped). Traceability is to specs.md requirements.

## Context
- Stack: Python 3.11+, FastAPI, OpenAI (embeddings and chat), ChromaDB (persistent), pypdf. Vanilla static UI.
- Layout: `code/app/{api,services,core,static}`, `code/tests/`.
- Dependencies between layers: api -> services -> core only. OpenAI clients are injected so tests can mock them.
- Dev wiring: the UI is served by the same FastAPI app on port 8000, so no proxy or CORS is needed. The UI calls the relative paths `/api/documents`, `/api/query` and `/health`.

## Steps
- [ ] **Step 1 - Foundation**: dependencies, config, errors, models, loaders, chunker, embeddings, LLM client, vector store, and their unit tests
- [ ] **Step 2 - Business logic and API**: IngestionService, QueryService, routers, app factory, and their unit tests
- [ ] **Step 3 - Frontend**: static UI (index.html, styles.css, app.js) built to the Enterprise UI Baseline
- [ ] **Step 4 - Documentation**: README, `.env.example`, unit summary

## File to User Story Map

| File path | User stories |
|-----------|--------------|
| code/requirements.txt | specs.md - all requirements |
| code/pytest.ini | specs.md - all requirements |
| code/.env.example | specs.md - configuration |
| code/.gitignore | specs.md - configuration |
| code/README.md | specs.md - run instructions |
| code/app/__init__.py | specs.md - all requirements |
| code/app/main.py | specs.md - API and UI serving |
| code/app/core/__init__.py | specs.md - all requirements |
| code/app/core/settings.py | specs.md - configuration |
| code/app/core/errors.py | specs.md - error handling |
| code/app/core/models.py | specs.md - documents and answers |
| code/app/core/loaders.py | specs.md - PDF, TXT, MD ingestion |
| code/app/core/chunker.py | specs.md - chunking |
| code/app/core/embeddings.py | specs.md - embeddings |
| code/app/core/llm.py | specs.md - answer generation |
| code/app/core/vector_store.py | specs.md - Chroma storage and retrieval |
| code/app/services/__init__.py | specs.md - all requirements |
| code/app/services/ingestion.py | specs.md - document ingestion |
| code/app/services/query.py | specs.md - question answering with sources |
| code/app/api/__init__.py | specs.md - all requirements |
| code/app/api/deps.py | specs.md - dependency injection |
| code/app/api/documents_router.py | specs.md - document management API |
| code/app/api/query_router.py | specs.md - query API |
| code/app/api/health_router.py | specs.md - health API |
| code/app/static/index.html | specs.md - web UI |
| code/app/static/styles.css | specs.md - web UI |
| code/app/static/app.js | specs.md - web UI |
| code/tests/__init__.py | specs.md - all requirements |
| code/tests/conftest.py | specs.md - testing |
| code/tests/test_chunker.py | specs.md - chunking |
| code/tests/test_loaders.py | specs.md - PDF, TXT, MD ingestion |
| code/tests/test_vector_store.py | specs.md - Chroma storage and retrieval |
| code/tests/test_ingestion.py | specs.md - document ingestion |
| code/tests/test_query.py | specs.md - question answering with sources |
| code/tests/test_api.py | specs.md - API |
