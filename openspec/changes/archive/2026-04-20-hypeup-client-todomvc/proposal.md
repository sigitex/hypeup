## Why

`@hypeup/client` has a working mount/signal/classify/apply pipeline but no end-to-end demo that exercises it under realistic conditions. A TodoMVC implementation serves as both a validation harness and a reference example — proving that the DSL's heterogeneous-argument model, reactive signals, and undo/redo slot system actually compose into a functioning application. It also surfaces gaps (event handling, conditional rendering, list operations) before external users hit them.

## What Changes

- Add a TodoMVC example app as `@hypeup/todomvc`, a new top-level workspace package (`todomvc/`)
- Implement the full TodoMVC spec (add, edit, toggle, delete, filter, clear completed, item count) using `@hypeup/client` primitives (`signal`, `computed`, `mount`) and `@hypeup/vdom` node types
- Wire up DOM event handling (click, dblclick, keydown, blur) — surfacing whatever pattern is needed since `@hypeup/client` currently has no event binding API
- Demonstrate list rendering with signals (signal-of-array pattern described in `plan-fe-runtime.md`)
- Include the standard TodoMVC CSS stylesheet
- Provide a minimal build/serve setup (Vite + `@hypeup/plugin`)

## Capabilities

### New Capabilities

- `todomvc-app`: Full TodoMVC application implementation exercising client mount, signals, computed values, DOM events, conditional rendering, and list management
- `client-events`: Event listener binding pattern for `@hypeup/client` — how DOM events integrate with the classify/apply model

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **New files**: `todomvc/` package directory with app source, entry point, index.html, and build config
- **@hypeup/client**: May need a small addition for event listener binding (e.g., an `on` helper or event handler classification) if no pattern currently exists
- **@hypeup/vdom**: No changes expected — existing node types suffice
- **Dependencies**: Vite (dev), `@hypeup/plugin` (dev) for the example build pipeline
- **Monorepo**: New workspace package `@hypeup/todomvc` at `todomvc/`
