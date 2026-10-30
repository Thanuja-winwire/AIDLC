# Code Summary: calculator

Files are under `code/`:
- `script.js`: the formatter, the pure engine (exported for Node) and the DOM and keyboard wiring
- `index.html`: the semantic markup, with 18 buttons and an aria-live display
- `styles.css`: design tokens, responsive grid, and hover, active, focus and error states
- `tests/engine.test.js`: node:test unit tests covering BR-1 to BR-12
- `package.json` and `README.md`

Checks done by reading the code: every file in the map exists, `index.html` references only `styles.css` and `script.js`, the `data-action` values match the handlers in `script.js`, and there are no external packages.
