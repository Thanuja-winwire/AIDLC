# Domain Entities

## CalculatorState (internal to the engine)
| Field | Type | Notes |
|---|---|---|
| current | string | Digits being typed or the formatted result. Default "0". |
| previous | number or null | Left operand while an operator is pending. |
| operator | "+" / "-" / "×" / "÷" / null | Pending operator. |
| overwrite | boolean | True after an operator or result, so the next digit starts a new number. |
| error | string or null | Error message, or null when valid. |
| expression | string | Text such as "12 ×" or "12 × 3 =". |

## DisplayState (output of getState)
| Field | Type | Notes |
|---|---|---|
| display | string | The main line, either the current value or the error message. |
| expression | string | The secondary line. |
| isError | boolean | Drives the error styling. |

## Operator
Enumeration: add "+", subtract "-", multiply "×", divide "÷". The keyboard characters "*" and "/" map to × and ÷.

## Relationships
The engine owns CalculatorState and derives DisplayState from it. The Formatter is a stateless helper. The view only reads DisplayState.
