# Functional Design Plan: RAG App (single unit)

Scope: detailed business logic, domain entities and business rules for the single FastAPI unit, plus frontend component design for the static UI. Source: specs.md and app-architecture.md.

## Steps
- [ ] Collect answers to the questions below
- [ ] Generate business-logic-model.md (ingestion, query, delete, list flows)
- [ ] Generate business-rules.md (validation, chunking, retrieval, answer rules)
- [ ] Generate domain-entities.md (Document, Chunk, Answer, Source)
- [ ] Generate frontend-components.md (UI structure, states, API calls, styling)

## Questions

## Question 1
How should uploading a file with the same name as an existing document be handled?

A) Replace the existing document (delete old vectors, ingest the new file)

B) Reject with a clear "already exists" error

C) Allow duplicates; each upload gets its own document id

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Replace the existing document (delete old vectors, ingest the new file)

## Question 2
How should the chunker split text?

A) Fixed character size with overlap (e.g. 1000 chars, 150 overlap), splitting on paragraph/sentence boundaries where possible

B) Fixed token size with overlap

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Fixed character size with overlap (e.g. 1000 chars, 150 overlap), splitting on paragraph/sentence boundaries where possible

## Question 3
How should retrieval decide the context is insufficient?

A) Apply a minimum similarity threshold; if no chunk passes, return "not enough information" without calling the LLM

B) Always send the top-k chunks and let the LLM decide, instructed to say so when context is lacking

C) Both: a threshold check, plus an LLM instruction to refuse when context is lacking

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Apply a minimum similarity threshold; if no chunk passes, return "not enough information" without calling the LLM

## Question 4
Should the query be answerable against a subset of documents?

A) No, always search all ingested documents

B) Yes, optional document filter selected in the UI

C) Other (please describe after [Answer]: tag below)

[Answer]: A) No, always search all ingested documents

## Question 5
Which styling approach should the static UI use (no build step)?

A) Custom CSS stylesheet with CSS variables and a modern design system (Recommended)

B) Bootstrap via CDN plus small custom stylesheet

C) Tailwind via CDN

D) Other (please describe after [Answer]: tag below)

[Answer]: A) Custom CSS stylesheet with CSS variables and a modern design system (Recommended)
