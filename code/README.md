# Calculator

A responsive calculator in plain HTML, CSS and vanilla JavaScript. It has no build step and no dependencies.

## Run
Open `index.html` in a browser, or serve the folder (`npx serve .`).

## Test
`npm test` (Node 18+) runs the engine unit tests.

## Features
- Add, subtract, multiply, divide (evaluated left to right), percent, decimals, clear and delete
- Keyboard support: digits, `. + - * /`, `%`, Enter or `=`, Backspace, Escape or `c`
- Invalid calculations (such as division by zero) show a clear error
- Layout works from 320px upward, with 44px minimum touch targets
