## MODIFIED Requirements

### Requirement: on() wraps handlers with auto-redraw
`on(event, handler)` SHALL wrap the user's handler such that `redraw()` is called after the handler executes. The `EventBinding` vdom node SHALL carry a flag indicating whether auto-redraw is enabled. The `on` type SHALL additionally expose dot-access properties for every key in `GlobalEventHandlersEventMap`, compiled to string calls by the babel plugin: `on.<event>(handler)` SHALL be equivalent to `on("<event>", handler)`.

#### Scenario: Auto-redraw after click
- **WHEN** `on("click", () => state.x++)` is used and the element is clicked
- **THEN** the handler SHALL execute, then `redraw()` SHALL be called

#### Scenario: Handler error does not prevent redraw
- **WHEN** an event handler throws an error
- **THEN** `redraw()` SHALL still be called (via try/finally)

#### Scenario: Dot-access shorthand equivalent to string call
- **WHEN** `on.click(handler)` is used
- **THEN** the babel plugin SHALL compile it to `on("click", handler)`, producing identical behavior

### Requirement: on.silent() skips auto-redraw
`on.silent(event, handler)` SHALL register the handler without auto-redraw wrapping. The `on.silent` type SHALL additionally expose dot-access properties for every key in `GlobalEventHandlersEventMap`, compiled to string calls by the babel plugin: `on.silent.<event>(handler)` SHALL be equivalent to `on.silent("<event>", handler)`.

#### Scenario: Silent click does not redraw
- **WHEN** `on.silent("click", logClick)` is used and the element is clicked
- **THEN** `logClick` SHALL execute but no redraw SHALL occur

#### Scenario: Silent dot-access shorthand equivalent to string call
- **WHEN** `on.silent.click(handler)` is used
- **THEN** the babel plugin SHALL compile it to `on.silent("click", handler)`, producing identical behavior
