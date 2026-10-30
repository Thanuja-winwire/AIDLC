# Frontend Components: RAG App

Static HTML/CSS/vanilla JS served by FastAPI. No build step. Files: `index.html`, `styles.css`, `app.js`.

## Layout
Responsive two-column layout (stacks below 900px):
- **Header**: product name, subtle status dot (from /health).
- **Left panel, Documents**: upload dropzone plus document list.
- **Right panel, Ask**: question form plus answer area.

## Components
| Component | Behaviour |
|---|---|
| UploadDropzone | Drag and drop or browse; multiple files; accepts .pdf/.txt/.md; client-side type/size check; per-file progress/status row. |
| DocumentList | Cards with file icon, filename, chunk count, delete button (confirm step). |
| QuestionForm | Textarea (Ctrl/Cmd+Enter submits), primary "Ask" button, disabled while loading or when no documents exist. |
| AnswerCard | Answer text with [n] markers, followed by SourceList. |
| SourceList | Numbered cards: filename, chunk/page, score badge, snippet (expandable). |
| Toast | Success and error notifications. |

## API calls
| Action | Call |
|---|---|
| Load list | GET /api/documents |
| Upload | POST /api/documents (multipart, one request per file) |
| Delete | DELETE /api/documents/{id} |
| Ask | POST /api/query `{question}` |
| Status | GET /health |

## States
| Area | Empty | Loading | Error |
|---|---|---|---|
| Documents | Illustration/icon, "No documents yet. Upload a PDF, TXT or Markdown file to get started." | Skeleton cards | Inline error panel with retry |
| Upload | n/a | Spinner per file, with "replaced" note when a file overwrote an existing one | Red-bordered row with server message |
| Answer | Hint text with example prompt; ask disabled until a document exists | Animated skeleton/typing indicator | Distinct error card with message |
| Insufficient context | Neutral info card with the "not enough information" message, no sources | n/a | n/a |

## Styling (custom CSS design system)
- CSS variables: brand accent (indigo), neutral scale, semantic success/warning/error/info colors, radii, shadows, spacing scale (4px base).
- Type scale: system UI font stack (Inter if available); 12/14/16/20/28 px with distinct weights.
- Primary button filled, secondary outlined, destructive uses red outline with a filled hover.
- Hover, focus-visible and disabled states on all controls; 150ms transitions; cards with border and soft elevation.
- Inline SVG icons for file, upload, trash, send, and status.
- Respects `prefers-reduced-motion`; accessible labels and focus order.
- Escape all server text before inserting into the DOM (textContent, no innerHTML for user data).
