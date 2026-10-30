# Integration Test Instructions

## Purpose
The app is a single static unit with no services or APIs. Its only integration surface is the DOM layer calling the engine, so integration testing is a manual or browser-driven check.

## Test Scenarios

### Scenario 1: InputController -> CalculatorEngine -> DisplayView
- **Setup**: serve `code/` with `npx serve .` and open it in a browser.
- **Steps**:
  1. Click `1`, `2`, `+`, `3`, `=`. Expect `15`.
  2. Click `2`, `0`, `0`, `+`, `1`, `0`, `%`, `=`. Expect `220`.
  3. Click `.`, `1`, `+`, `.`, `2`, `=`. Expect `0.3`.
  4. Click `5`, `÷`, `0`, `=`. Expect "Cannot divide by zero" with the error style, then press `C` to recover.
  5. Click `1`, `2`, `3`, then `DEL`. Expect `12`.
- **Cleanup**: press `C`.

### Scenario 2: Keyboard input
- Type `9*3` then Enter. Expect `27`.
- Backspace deletes a digit. Escape clears.

### Scenario 3: Responsive layout
- Check viewport widths 320px, 375px, 768px and 1280px. Expect no horizontal scroll, buttons of 44px or more, and a readable display.

## Run
There is no automated integration suite. Verify may add a headless browser check.

## Cleanup
Stop the `serve` process.
