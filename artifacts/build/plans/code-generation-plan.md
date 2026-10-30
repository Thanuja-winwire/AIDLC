# Code Generation Plan: Calculator Web App (single unit)

User Stories were skipped in Inception, so the map traces files to the specification requirements (FR-1 to FR-10, NFR-1 to NFR-7) instead.

## Unit context
- Single static unit with no backend and no external dependencies.
- Inputs: `app-architecture.md`, `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `frontend-components.md`.
- Location: greenfield, so everything is under `code/`.

## Steps
- [ ] **Step 1: Foundation and logic.** `package.json` with a zero-dependency Node test script. The pure engine and formatter in `script.js`, exported through `module.exports`. Unit tests in `tests/engine.test.js` covering BR-1 to BR-12.
- [ ] **Step 2: Frontend.** `index.html` with semantic markup and `data-testid` attributes. `styles.css` with design tokens, hover/active/focus/error states and responsive layout (320px up, 44px or larger targets, `100dvh`). DOM wiring in `script.js` (DisplayView, InputController, keyboard map, aria-live).
- [ ] **Step 3: Documentation.** `README.md` (run, test, keyboard shortcuts) and the unit summary in `artifacts/build/calculator/docs/code-summary.md`.

## Contracts
- `script.js` defines `createEngine()` and `formatNumber()`. In the browser it runs on `DOMContentLoaded`. In Node it exports `{ createEngine, formatNumber }` and does not touch the DOM.
- `index.html` loads `styles.css` and `script.js` by relative path. Button actions come from `data-action` (digit, decimal, operator, percent, equals, clear, delete) and `data-value`.

## File to User Story Map

| File path | Requirements implemented |
|-----------|--------------------------|
| code/package.json | FR-1; NFR-6 |
| code/script.js | FR-1; FR-2; FR-3; FR-4; FR-5; FR-6; FR-7; FR-8; FR-9; FR-10 |
| code/tests/engine.test.js | FR-1; FR-2; FR-3; FR-4; FR-5; FR-7; FR-9; FR-10 |
| code/index.html | FR-6; NFR-1; NFR-5; NFR-7 |
| code/styles.css | NFR-1; NFR-2; NFR-3; NFR-4; NFR-5 |
| code/README.md | NFR-6 |
