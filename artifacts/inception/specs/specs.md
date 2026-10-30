# Specification: RAG App

## Overview
A Retrieval-Augmented Generation web app. Users upload documents, then ask questions and receive answers grounded in those documents, with source citations.

## Decisions (from approved Q&A)
- Stack: Python, FastAPI backend, simple web UI
- LLM and embeddings: OpenAI (GPT chat model + OpenAI embeddings)
- Documents: user-uploaded PDF, TXT, Markdown
- Vector store: local (Chroma)

## Functional Requirements
1. **Upload**: User uploads one or more PDF/TXT/MD files via the UI.
2. **Ingestion**: Extract text, split into overlapping chunks, embed with OpenAI, and store in the local Chroma vector store with source metadata.
3. **Document list**: UI lists ingested documents and allows deleting one (removes its vectors).
4. **Ask**: User submits a question. The system embeds it, retrieves the top-k relevant chunks, and prompts the LLM with the chunks as context.
5. **Answer**: Return the answer plus the cited source chunks (filename, snippet). If the context is insufficient, say so rather than guessing.
6. **API**: REST endpoints `POST /api/documents`, `GET /api/documents`, `DELETE /api/documents/{id}`, `POST /api/query`, `GET /health`.

## Non-Functional Requirements
- Config via environment variables (`OPENAI_API_KEY`, model names, chunk size, top-k); no secrets in code.
- Validate file type and size (e.g. max 20 MB); clear error messages.
- Persist the vector store on local disk so it survives restarts.
- Single-user, local deployment; no authentication in scope.
- Polished, responsive UI with loading, empty and error states.
- Unit tests for chunking, ingestion and query logic, with OpenAI mocked.

## Out of Scope
Authentication, multi-tenancy, hosted vector DB, streaming responses, OCR of scanned PDFs.

## Assumptions
- Single deployable unit (one FastAPI app serving the UI and API).
- Default models: `gpt-4o-mini` and `text-embedding-3-small`, configurable.
