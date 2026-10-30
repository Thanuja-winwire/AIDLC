# Specification: Simple Responsive Calculator Web App

## 1. Overview
A simple, responsive, modern-looking calculator web app that runs in desktop and mobile browsers.

## 2. Decisions (from clarifying questions)
| Topic | Decision |
|---|---|
| Tech stack | Plain HTML, CSS, vanilla JavaScript, no build step |
| Input methods | On-screen buttons plus keyboard input |
| History / theme | Neither; keep it minimal |
| Workflow type | Simple |

## 3. Functional Requirements
- FR-1: Addition, subtraction, multiplication and division.
- FR-2: Percentage operation (a % value converts to value/100; with a prior operand, e.g. 200 + 10% means 200 + 20).
- FR-3: Decimal input, with only one decimal point per number.
- FR-4: Clear (C/AC) resets the entire state.
- FR-5: Delete (backspace) removes the last entered digit.
- FR-6: Display shows the current input and the pending expression (e.g. "12 ×") separately from the result.
- FR-7: Invalid calculations (division by zero, malformed input, non-finite result) show a clear error message such as "Cannot divide by zero". The app recovers on the next input or Clear.
- FR-8: Keyboard support: digits 0-9, `.`, `+ - * /`, `%`, Enter or `=` to calculate, Backspace to delete, Escape or `C` to clear.
- FR-9: Floating-point results are rounded to avoid artifacts (e.g. 0.1 + 0.2 displays 0.3). Long values scale or format to fit the display.
- FR-10: Chained operations are supported (e.g. 2 + 3 × 4), evaluated left to right as on a standard basic calculator.

## 4. Non-Functional Requirements
- NFR-1 Responsive: usable from about 320px wide up to desktop. The layout is a button grid that scales.
- NFR-2 Touch: buttons are at least 44x44px touch targets on mobile.
- NFR-3 Compatibility: current Chrome, Edge, Firefox and Safari, on desktop, iOS and Android.
- NFR-4 Modern UI: a deliberate type scale, spacing and color system. Distinct styling for operator, equals, and clear/delete buttons. Hover, focus and active states. Visible focus rings for accessibility.
- NFR-5 Accessibility: semantic buttons with aria-labels, a live region for the display, and sufficient color contrast.
- NFR-6 Performance: static files only, no external dependencies, instant response.
- NFR-7 Error states are visually distinct from normal results.

## 5. Out of Scope
Calculation history, theme toggle, scientific functions, backend or persistence.

## 6. Deliverables
`index.html`, `styles.css`, `script.js`, and a README with run instructions. The app opens directly in a browser.

## 7. Assumptions
- Single unit of work; no user personas are needed beyond a generic end user.
- Percentage behaviour follows the common standard-calculator convention (FR-2).
