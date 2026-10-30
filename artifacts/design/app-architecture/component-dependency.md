# Component Dependencies

## Dependency matrix (row depends on column)
| | Settings | loaders | Chunker | Embedding | LLM | VectorStore | Ingestion | Query |
|---|---|---|---|---|---|---|---|---|
| documents_router | | | | | | | X | |
| query_router | | | | | | | | X |
| IngestionService | X | X | X | X | | X | | |
| QueryService | X | | | X | X | X | | |
| EmbeddingClient | X | | | | | | | |
| LLMClient | X | | | | | | | |
| VectorStore | X | | | | | | | |
| Chunker | X | | | | | | | |

Rule: dependencies point downward only (api -> services -> core). Core never imports services or api.

## Communication
In-process function calls. External calls: OpenAI HTTPS (embeddings, chat) and local Chroma on disk.

## Data flow
```
Upload:  Browser -> documents_router -> IngestionService -> loaders -> Chunker
                                        -> EmbeddingClient -> OpenAI
                                        -> VectorStore -> Chroma (disk)

Query:   Browser -> query_router -> QueryService -> EmbeddingClient -> OpenAI
                                    -> VectorStore (top-k)
                                    -> LLMClient -> OpenAI
                                    -> answer + sources -> Browser
```
