# Application Architecture Plan

Scope: single FastAPI unit RAG app (upload, ingest, list/delete, query with citations), minimal depth. Source: specs.md.

## Plan Checklist
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Generate app-architecture.md (consolidated)
- [ ] Validate completeness and consistency

## Questions

## Question 1
How should the backend code be organised?

A) Layered modules in one package: api (routes), services (ingestion, query), core (chunker, loaders, embeddings, vector store) (Recommended)

B) Flat: a few large modules (main.py, rag.py)

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Layered modules in one package: api (routes), services (ingestion, query), core (chunker, loaders, embeddings, vector store) (Recommended)

## Question 2
How should ingestion run when a file is uploaded?

A) Synchronously within the upload request; respond when ingestion finishes (Recommended for a single-user local app)

B) Background task; upload returns immediately and the UI polls status

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Synchronously within the upload request; respond when ingestion finishes (Recommended for a single-user local app)

## Question 3
How should the web UI be served?

A) Static HTML/CSS/JS files served by the same FastAPI app, with no build step (Recommended)

B) Separate React/Vite frontend

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Static HTML/CSS/JS files served by the same FastAPI app, with no build step (Recommended)
