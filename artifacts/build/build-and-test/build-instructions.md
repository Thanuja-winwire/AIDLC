# Build Instructions

## Prerequisites
- **Build Tool**: none. The app is static HTML, CSS and JavaScript with no compile or bundle step.
- **Dependencies**: none at runtime. Node.js 18 or later is needed only to run the unit tests (`node --test`).
- **Environment Variables**: none.
- **System Requirements**: any OS, and a modern browser (Chrome, Firefox, Safari or Edge).

## Build Steps

### 1. Install Dependencies
```bash
cd code
npm install   # no dependencies; this only validates package.json
```

### 2. Configure Environment
No configuration is needed.

### 3. Build All Units
There is no build step. The deliverables are `code/index.html`, `code/styles.css` and `code/script.js`.

### 4. Verify Build Success
- Confirm `index.html` references `styles.css` and `script.js` with relative paths, and that both files exist.
- Serve locally: `cd code && npx serve .`, then open the printed URL. Opening `index.html` directly also works.
- Whole-application smoke check: the single unit has no backend, so there are no ports or proxies to reconcile.
  - The keypad renders.
  - Press `7`, `+`, `8`, `=` and confirm the display shows `15`.
  - Press `5`, `÷`, `0`, `=` and confirm the display shows "Cannot divide by zero".

## Troubleshooting

### Page is unstyled or buttons do nothing
- **Cause**: the files were moved apart, so the relative paths broke.
- **Solution**: keep `index.html`, `styles.css` and `script.js` in the same folder.

### `npm test` fails to find tests
- **Cause**: Node is older than 18.
- **Solution**: upgrade Node to version 18 or later.
