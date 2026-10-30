# Performance Test Instructions

## Purpose
This is a client-side static app with no server, so load and stress testing don't apply.

## Performance Requirements
- **Interaction latency**: the display updates in under 100 ms after a press.
- **Load**: a Lighthouse performance score of 90 or more on mobile emulation.
- **Payload**: under 50 KB in total, with no third-party requests.

## How to Check
1. Serve `code/` and open it in Chrome.
2. Run DevTools > Lighthouse (Mobile, Performance and Accessibility).
3. Check the Network tab: three requests (HTML, CSS, JS), no external ones.

## Optimization
If the score is below target, inspect render-blocking resources and file sizes.
