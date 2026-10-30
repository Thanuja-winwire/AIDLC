# Services

There is no backend and no service layer. The only orchestration is client-side.

| Orchestrator | Responsibility |
|---|---|
| InputController | Receives user input from any source (click or key), turns it into an engine action, then re-renders from `getState()`. |

Flow: input event -> InputController -> CalculatorEngine (mutates state, uses Formatter) -> `getState()` -> DisplayView.render.

Errors (such as division by zero) are represented in engine state. They are never thrown to the UI, and the next input or Clear recovers (FR-7).
