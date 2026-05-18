## MODIFIED Requirements

### Requirement: on() creates EventBinding with autoRedraw flag
`on(event, handler)` SHALL create an `EventBinding` vdom node carrying the raw handler and an `autoRedraw` flag set to `true`. It SHALL NOT wrap the handler with `redraw()` at construction time. The `EventBinding` vdom node SHALL carry a flag indicating whether auto-redraw is enabled. The mount/hydrate `apply` layer SHALL wrap the handler with the owning root's scoped redraw function when `autoRedraw` is true.

#### Scenario: Auto-redraw after click
- **WHEN** `on("click", () => state.x++)` is used and the element is clicked
- **THEN** the handler SHALL execute, then the owning root's redraw SHALL be called

#### Scenario: Handler error does not prevent redraw
- **WHEN** an event handler throws an error
- **THEN** the owning root's redraw SHALL still be called (via try/finally)

#### Scenario: EventBinding stores raw handler
- **WHEN** `on("click", myHandler)` is called
- **THEN** the resulting `EventBinding` SHALL store `myHandler` as the handler (not a wrapped version)
- **AND** `autoRedraw` SHALL be `true`

### Requirement: on.silent() skips auto-redraw
`on.silent(event, handler)` SHALL create an `EventBinding` with `autoRedraw` set to `false`. The mount/hydrate `apply` layer SHALL install the handler directly without redraw wrapping.

#### Scenario: Silent click does not redraw
- **WHEN** `on.silent("click", logClick)` is used and the element is clicked
- **THEN** `logClick` SHALL execute but no redraw SHALL occur

#### Scenario: Silent EventBinding stores raw handler with autoRedraw false
- **WHEN** `on.silent("click", myHandler)` is called
- **THEN** the resulting `EventBinding` SHALL store `myHandler` as the handler
- **AND** `autoRedraw` SHALL be `false`
