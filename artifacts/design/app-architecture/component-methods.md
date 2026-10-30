# Component Methods

Detailed rules are defined in Functional Design.

## CalculatorEngine
| Method | Input -> Output | Purpose |
|---|---|---|
| `createEngine()` | none -> engine | Factory that creates a fresh state. |
| `inputDigit(d)` | string -> void | Append a digit to the current entry. |
| `inputDecimal()` | none -> void | Add a decimal point, at most one per number. |
| `inputOperator(op)` | `'+' \| '-' \| '*' \| '/'` -> void | Set the pending operator. Evaluates a chained operation left to right. |
| `inputPercent()` | none -> void | Apply the percentage rule (FR-2). |
| `calculate()` | none -> void | Evaluate the pending operation. |
| `clear()` | none -> void | Reset all state (FR-4). |
| `deleteLast()` | none -> void | Remove the last entered digit (FR-5). |
| `getState()` | none -> `{display, expression, isError, errorMessage}` | Read-only snapshot for rendering. |

## Formatter
| Method | Input -> Output | Purpose |
|---|---|---|
| `formatNumber(n)` | number -> string | Round to about 12 significant digits and use exponential notation for very large or small values. |

## DisplayView
| Method | Input -> Output | Purpose |
|---|---|---|
| `render(state)` | state -> void | Update the DOM, the error styling and the live region. |

## InputController
| Method | Input -> Output | Purpose |
|---|---|---|
| `init()` | none -> void | Bind click handlers and the keydown handler, then do the first render. |
| `handleKey(event)` | KeyboardEvent -> void | Map keys to actions (FR-8). |
| `handleClick(event)` | MouseEvent -> void | Map `data-action` attributes to actions. |
