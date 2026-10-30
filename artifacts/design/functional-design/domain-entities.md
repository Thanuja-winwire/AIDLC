# Domain Entities: RAG App

## Document
| Field | Type | Notes |
|---|---|---|
| id | str | sha1 of the sanitised filename |
| filename | str | |
| chunk_count | int | |
| uploaded_at | datetime (UTC) | stored in chunk metadata |
| replaced | bool | true if the upload replaced an existing one (response only) |

## Chunk
| Field | Type | Notes |
|---|---|---|
| chunk_id | str | `{document_id}:{chunk_index}` |
| document_id | str | |
| filename | str | |
| chunk_index | int | 0-based |
| page | int or null | PDFs only |
| text | str | |
| embedding | list[float] | stored in Chroma, not exposed by the API |
| uploaded_at | str | ISO 8601 |

## RetrievedChunk
Chunk plus `score: float` (similarity 0 to 1).

## Source (API)
`filename`, `chunk_index`, `page` (optional), `snippet` (<= 300 chars), `score`.

## Answer (API)
`answer: str`, `sources: list[Source]`.

## Error (API)
`detail: str`.

## Relationships
```
Document 1 --- * Chunk       (by document_id; deleting a Document deletes its Chunks)
Answer   1 --- * Source      (each Source is a RetrievedChunk projection)
```

## Persistence
Only Chunks are persisted (Chroma collection `documents`, cosine space). Documents are derived by aggregating chunk metadata; there is no separate document table.
