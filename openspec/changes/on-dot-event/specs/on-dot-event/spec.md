## ADDED Requirements

### Requirement: on.{event} shorthand creates event binding with auto-redraw
`on.<event>(handler)` SHALL be equivalent to `on("<event>", handler)` for any event name. The returned `EventBinding` SHALL have auto-redraw behavior identical to calling `on` directly.

#### Scenario: on.click shorthand
- **WHEN** `on.click(handler)` is used
- **THEN** the result SHALL be identical to `on("click", handler)`

#### Scenario: on.keydown shorthand
- **WHEN** `on.keydown(handler)` is used
- **THEN** the result SHALL be identical to `on("keydown", handler)`

#### Scenario: Auto-redraw via shorthand
- **WHEN** `on.click(() => state.x++)` is used and the element is clicked
- **THEN** the handler SHALL execute, then `redraw()` SHALL be called

### Requirement: on.silent.{event} shorthand creates event binding without auto-redraw
`on.silent.<event>(handler)` SHALL be equivalent to `on.silent("<event>", handler)` for any event name. The returned `EventBinding` SHALL skip auto-redraw.

#### Scenario: on.silent.click shorthand
- **WHEN** `on.silent.click(handler)` is used
- **THEN** the result SHALL be identical to `on.silent("click", handler)`

#### Scenario: No redraw via silent shorthand
- **WHEN** `on.silent.click(logClick)` is used and the element is clicked
- **THEN** `logClick` SHALL execute but no redraw SHALL occur

### Requirement: Dot-access is implemented via Proxy
The `on` export SHALL be wrapped in a `Proxy` whose `get` trap intercepts property access. For any property name other than `silent`, the trap SHALL return a function `(handler) => on(prop, handler)`. The `silent` property SHALL return a similarly proxied version of `on.silent`.

#### Scenario: Arbitrary event name via dot-access
- **WHEN** `on.customevent(handler)` is used with a non-standard event name
- **THEN** the result SHALL be identical to `on("customevent", handler)`

### Requirement: Type definitions provide full event inference
The type of `on` SHALL include a mapped type over `GlobalEventHandlersEventMap` so that `on.click(e => ...)` infers `e` as `MouseEvent`, `on.keydown(e => ...)` infers `e` as `KeyboardEvent`, etc. The same mapped type SHALL apply to `on.silent`.

#### Scenario: MouseEvent inference on on.click
- **WHEN** a user writes `on.click(e => e.clientX)`
- **THEN** TypeScript SHALL infer `e` as `MouseEvent` without explicit annotation

#### Scenario: KeyboardEvent inference on on.keydown
- **WHEN** a user writes `on.keydown(e => e.key)`
- **THEN** TypeScript SHALL infer `e` as `KeyboardEvent` without explicit annotation
