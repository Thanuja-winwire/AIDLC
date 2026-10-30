# Application Architecture Plan (minimal depth)

Scope: single-unit static calculator (HTML/CSS/vanilla JS), derived from specs.md. The stack, input methods and scope were settled in Requirements, so no open design questions remain.

## Steps
- [x] Analyze specs.md (FR-1..FR-10, NFR-1..NFR-7)
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate app-architecture.md (consolidated)
- [x] Validate completeness: every FR maps to a component

## Design decisions
- Separate pure logic (Calculator engine) from DOM code (UI) so the logic can be unit-tested without a browser.
- A single state object is owned by the engine. The UI only renders it.
- Left-to-right evaluation, with no expression parser (FR-10).
- Plain scripts and no modules, so the app opens from file:// without a server.
