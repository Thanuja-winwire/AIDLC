# Components

Single FastAPI package `app/` with layered modules: api, services, core.

## API layer (`app/api`)
| Component | Responsibility |
|---|---|
| `documents_router` | `POST/GET /api/documents`, `DELETE /api/documents/{id}`; validates upload type/size |
| `query_router` | `POST /api/query` |
| `health_router` | `GET /health` |
| `static_ui` | Serves static HTML/CSS/JS from the same app at `/` (no build step) |

## Service layer (`app/services`)
| Component | Responsibility |
|---|---|
| `IngestionService` | Orchestrates load -> chunk -> embed -> store, synchronously within the upload request; document list/delete |
| `QueryService` | Orchestrates embed question -> retrieve top-k -> build prompt -> LLM -> answer with citations |

## Core layer (`app/core`)
| Component | Responsibility |
|---|---|
| `Settings` | Env-based config (API key, models, chunk size, overlap, top-k, max upload size, data dir) |
| `loaders` | Extract text from PDF, TXT, MD |
| `Chunker` | Split text into overlapping chunks |
| `EmbeddingClient` | OpenAI embeddings wrapper |
| `LLMClient` | OpenAI chat completion wrapper |
| `VectorStore` | Chroma persistent store wrapper (add, query, list, delete by document) |

## Frontend (`app/static`)
Single page: upload panel, document list with delete, question box, answer with source citations; loading, empty and error states.
