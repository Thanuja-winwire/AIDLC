# Business Rules

| ID | Rule | Spec |
|---|---|---|
| BR-1 | Operations are + - × ÷, evaluated left to right with no operator precedence (2 + 3 × 4 = 20). | FR-1, FR-10 |
| BR-2 | Percent: with a pending + or -, the value becomes previous × value / 100 (200 + 10% = 220). With × or ÷, or with no pending operator, it becomes value / 100. | FR-2 |
| BR-3 | A number holds at most one decimal point. A leading "." becomes "0.". | FR-3 |
| BR-4 | Input is limited to 15 digits. | FR-9 |
| BR-5 | Delete removes the last typed character. It never edits a computed result. An empty or "-" input becomes "0". | FR-5 |
| BR-6 | Clear resets all state, including any error. | FR-4 |
| BR-7 | Division by zero gives the error "Cannot divide by zero". Non-finite or NaN gives "Invalid result". | FR-7 |
| BR-8 | In the error state, the next digit, decimal or Clear starts fresh. Operators, percent and equals are ignored. Delete clears. | FR-7 |
| BR-9 | Rounding: result = Number(result.toPrecision(12)), so 0.1 + 0.2 shows 0.3. | FR-9 |
| BR-10 | Formatting: numbers beyond 1e15 or below 1e-9 use exponential notation with up to 8 significant digits. Other numbers show without trailing zeros. A long value is also scaled down in font size by the view to fit. | FR-9 |
| BR-11 | Pressing an operator twice replaces the pending operator and does not evaluate. | FR-10 |
| BR-12 | Pressing equals with no pending operator does nothing. | FR-1 |
| BR-13 | Keyboard map: 0-9 digits, "." decimal, + - * / operators ("*" is ×, "/" is ÷, and preventDefault is called on "/"), % percent, Enter or "=" calculate, Backspace delete, Escape or "c"/"C" clear. | FR-8 |
| BR-14 | The error text is shown in the main display with a distinct error style and is announced through the aria-live region. | NFR-5, NFR-7 |
