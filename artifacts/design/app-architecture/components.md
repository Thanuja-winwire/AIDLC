# Components

| Component | File | Purpose |
|---|---|---|
| CalculatorEngine | script.js (pure, no DOM) | Owns calculator state and all arithmetic rules. Handles digits, decimal, operators, percent, equals, clear and delete. Returns a display state. |
| Formatter | script.js (pure) | Rounds floating-point artifacts and formats numbers to fit the display (FR-9). |
| DisplayView | script.js (DOM) | Renders the expression line, the main value and the error state. Updates the aria-live region. |
| InputController | script.js (DOM) | Maps button clicks and keyboard events (FR-8) to engine actions. |
| Layout and Styling | index.html, styles.css | Semantic button grid, type scale, color system, focus/hover/active states, responsive layout, 44px targets. |

## Interfaces
- InputController -> CalculatorEngine: `dispatch(action)`, where an action is `{type, value?}`.
- InputController -> DisplayView: `render(engine.getState())`.
- CalculatorEngine -> Formatter: `format(number)`.
