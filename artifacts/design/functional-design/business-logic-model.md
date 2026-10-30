# Business Logic Model: Calculator Engine

## State
`current` (string being typed or shown), `previous` (number or null), `operator` (+ - × ÷ or null), `overwrite` (bool: next digit replaces `current`), `error` (string or null), `expression` (string shown above the display).

Initial: current "0", previous null, operator null, overwrite false, error null.

## Operations
| Operation | Behaviour |
|---|---|
| inputDigit(d) | If error, reset first. If overwrite or current is "0", current = d, overwrite = false. Otherwise append d. Max 15 digits; extra digits ignored. |
| inputDecimal() | If error, reset. If overwrite, current = "0.". If current has no ".", append ".". Otherwise ignore. |
| inputOperator(op) | If error, ignore. If an operator is pending and the user has typed a second operand (overwrite is false), evaluate first (left-to-right chaining) and use the result as previous. Else previous = Number(current). Set operator = op, overwrite = true, expression = "previous op". If the operator is pressed again with no new operand, it replaces the pending operator. |
| inputPercent() | If error, ignore. Let v = Number(current). If an operator is pending with previous p: for + and -, v = p * v / 100; for × and ÷, v = v / 100. If no operator pending, v = v / 100. current = format(v), overwrite = false. |
| calculate() | If no operator pending, do nothing. Evaluate previous op current. On success, current = format(result), previous = null, operator = null, overwrite = true, expression = full expression with "=". On failure, set error. |
| clear() | Reset to the initial state. |
| deleteLast() | If error, clear. If overwrite (showing a result), do nothing. Otherwise remove the last character of current. If the result is empty or "-", current = "0". |
| getState() | Returns a read-only snapshot: display text, expression text, isError. |

## Evaluate
a + b, a - b, a × b, a ÷ b. Division with b = 0 gives error "Cannot divide by zero". A result that is NaN or not finite gives error "Invalid result". Valid results go through rounding (see business-rules.md).

## Flow
event -> InputController -> engine operation -> getState -> DisplayView.render.
