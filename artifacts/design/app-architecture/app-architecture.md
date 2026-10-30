# Application Architecture: Calculator Web App

## Summary
A static, single-page client app built with HTML, CSS and vanilla JS and no build step. It is split into a pure logic core (CalculatorEngine and Formatter) and a thin DOM layer (DisplayView and InputController).

## Components
- **CalculatorEngine**: state and arithmetic (add, subtract, multiply, divide, percent, decimal, clear, delete, chaining, error state).
- **Formatter**: rounding and display formatting.
- **DisplayView**: rendering, error styling and the aria-live region.
- **InputController**: click and keyboard mapping.
- **Layout and Styling**: a semantic button grid with a responsive, accessible modern UI.

## Key methods
`inputDigit`, `inputDecimal`, `inputOperator`, `inputPercent`, `calculate`, `clear`, `deleteLast`, `getState`, `formatNumber`, `render`, `init`.

## Services
There is no backend. InputController orchestrates the flow: event -> engine -> getState -> render.

## Dependencies
InputController -> (CalculatorEngine -> Formatter, DisplayView). There are no external libraries.

## Files
`index.html`, `styles.css`, `script.js`, `README.md`.

## Requirement coverage
| Requirement | Component |
|---|---|
| FR-1, FR-2, FR-3, FR-4, FR-5, FR-10 | CalculatorEngine |
| FR-6, FR-7 (display) | DisplayView, CalculatorEngine state |
| FR-7 (error handling) | CalculatorEngine |
| FR-8 | InputController |
| FR-9 | Formatter |
| NFR-1..NFR-5, NFR-7 | Layout and Styling, DisplayView |
| NFR-6 | Static files, no dependencies |

## Testability
The engine is a pure module. `script.js` exposes it via `module.exports` when `module` is defined, so it can be unit-tested in Node while still running as a plain browser script.
