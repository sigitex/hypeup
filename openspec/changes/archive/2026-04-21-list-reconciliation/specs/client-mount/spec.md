## ADDED Requirements

### Requirement: mount handles Each
When `processArg()` encounters an `Each` (returned by the `each()` primitive), it SHALL delegate to the `each()` mounting logic rather than treating it as a plain array or child element. The `each()` mounting logic SHALL create the outer structural effect and per-item effects, and manage the keyed DOM node map within the parent element.

#### Scenario: Each classified and mounted
- **WHEN** `mount(elem("ul", [each(state.items, i => i.id, i => li(i.name))]))` is called
- **THEN** `processArg()` SHALL detect the `Each` and delegate to the each mounting logic
- **AND** the `ul` element SHALL contain one `li` child per item in `state.items`

#### Scenario: Each among other children
- **WHEN** `mount(elem("div", [elem("h1", ["Title"]), each(state.items, i => i.id, i => li(i.name))]))` is called
- **THEN** the `h1` SHALL be mounted as a static child and the `Each` SHALL be mounted with reconciliation support, both as children of the `div`

#### Scenario: Each disposal via parent
- **WHEN** the parent element containing an `Each` is disposed
- **THEN** the each mounting logic SHALL dispose all per-item effects and the structural effect
