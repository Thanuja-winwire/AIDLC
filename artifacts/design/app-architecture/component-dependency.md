# Component Dependencies

| Component | Depends on |
|---|---|
| InputController | CalculatorEngine, DisplayView |
| DisplayView | DOM only (reads state passed in) |
| CalculatorEngine | Formatter |
| Formatter | none |
| Layout and Styling | none (the JS reads `data-action` attributes from the HTML) |

## Data flow
```
+--------+   events   +-----------------+  actions  +------------------+
|  User  | ---------> | InputController | --------> | CalculatorEngine |
+--------+            +-----------------+           +------------------+
                         |                              |
                         | render(state)                | format()
                         v                              v
                     +-------------+               +-----------+
                     | DisplayView |               | Formatter |
                     +-------------+               +-----------+
```

Communication is by synchronous function calls. There is no global state beyond the engine instance, and there are no external dependencies.
