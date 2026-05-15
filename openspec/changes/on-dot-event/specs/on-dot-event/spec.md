## ADDED Requirements

### Requirement: on.{event} shorthand creates event binding with auto-redraw
`on.<event>(handler)` SHALL be equivalent to `on("<event>", handler)` for any event name. The returned `EventBinding` SHALL have auto-redraw behavior identical to calling `on` directly.

#### Scenario: on.click shorthand
- **WHEN** `on.click(handler)` is used
- **THEN** the babel plugin SHALL compile it to `on("click", handler)`

#### Scenario: on.keydown shorthand
- **WHEN** `on.keydown(handler)` is used
- **THEN** the babel plugin SHALL compile it to `on("keydown", handler)`

#### Scenario: Auto-redraw via shorthand
- **WHEN** `on.click(() => state.x++)` is used and the element is clicked
- **THEN** the handler SHALL execute, then `redraw()` SHALL be called (behavior inherited from the compiled `on("click", ...)` call)

### Requirement: on.silent.{event} shorthand creates event binding without auto-redraw
`on.silent.<event>(handler)` SHALL be equivalent to `on.silent("<event>", handler)` for any event name. The returned `EventBinding` SHALL skip auto-redraw.

#### Scenario: on.silent.click shorthand
- **WHEN** `on.silent.click(handler)` is used
- **THEN** the babel plugin SHALL compile it to `on.silent("click", handler)`

#### Scenario: No redraw via silent shorthand
- **WHEN** `on.silent.click(logClick)` is used and the element is clicked
- **THEN** `logClick` SHALL execute but no redraw SHALL occur (behavior inherited from the compiled `on.silent("click", ...)` call)

### Requirement: Dot-access is implemented via compile-time babel transform
The babel plugin SHALL intercept member expression access on `on` identifiers. For any property name other than `silent`, the plugin SHALL transform `on.<prop>(handler)` into `on("<prop>", handler)`. For `on.silent.<prop>(handler)`, the plugin SHALL transform it into `on.silent("<prop>", handler)`. No runtime Proxy or wrapper is involved.

#### Scenario: Arbitrary event name via dot-access
- **WHEN** `on.customevent(handler)` is used
- **THEN** the babel plugin SHALL compile it to `on("customevent", handler)`

### Requirement: Type definitions provide full event inference via augmentable OnEventMap
The lexicon SHALL export an `OnEventMap` interface that extends `GlobalEventHandlersEventMap`. The mapped types for `on` and `on.silent` SHALL reference `OnEventMap` so that `on.click(e => ...)` infers `e` as `MouseEvent`, `on.keydown(e => ...)` infers `e` as `KeyboardEvent`, etc. Users SHALL be able to augment `OnEventMap` via module augmentation to add custom event types.

#### Scenario: MouseEvent inference on on.click
- **WHEN** a user writes `on.click(e => e.clientX)`
- **THEN** TypeScript SHALL infer `e` as `MouseEvent` without explicit annotation

#### Scenario: KeyboardEvent inference on on.keydown
- **WHEN** a user writes `on.keydown(e => e.key)`
- **THEN** TypeScript SHALL infer `e` as `KeyboardEvent` without explicit annotation

#### Scenario: Custom event via module augmentation
- **GIVEN** the user has declared `declare module "@hypeup/lexicon" { interface OnEventMap { "app:notify": CustomEvent<{ message: string }> } }`
- **WHEN** the user writes `on("app:notify", e => e.detail.message)`
- **THEN** TypeScript SHALL infer `e` as `CustomEvent<{ message: string }>` without explicit annotation
