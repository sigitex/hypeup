## ADDED Requirements

### Requirement: hydrateIsland hydrates a single island root
`hydrateIsland(root, componentFn)` SHALL accept a root DOM element and a component function. It SHALL hydrate the existing server-rendered DOM inside `root` and return an `AppHandle`. It is functionally equivalent to `hydrate()` and exists as a semantic convenience for island architecture usage.

#### Scenario: Single island hydrated
- **WHEN** `hydrateIsland(islandRoot, () => Counter())` is called on a server-rendered island
- **THEN** the island SHALL be hydrated and interactive
- **AND** the returned handle SHALL have `redraw()` and `dispose()` methods

#### Scenario: Multiple islands hydrated independently
- **WHEN** `hydrateIsland` is called on two different root elements with different components
- **THEN** each island SHALL have independent state and redraw cycles
- **AND** a click in island A SHALL only redraw island A (via scoped auto-redraw)

### Requirement: hydrateIslands discovers and hydrates multiple islands by selector
`hydrateIslands(selector, registry)` SHALL query the document for all elements matching `selector`, read each element's `data-island` attribute to look up the component function in `registry`, and hydrate each match. It SHALL return an array of `AppHandle` objects.

#### Scenario: Discover and hydrate islands by data attribute
- **WHEN** the document contains `<div data-island="Counter">...</div>` and `<div data-island="Timer">...</div>`
- **AND** `hydrateIslands("[data-island]", { Counter: () => Counter(), Timer: () => Timer() })` is called
- **THEN** both islands SHALL be hydrated with their respective components

#### Scenario: Unknown island name is skipped
- **WHEN** the document contains `<div data-island="Unknown">...</div>` and `registry` does not have an `Unknown` key
- **THEN** that element SHALL be skipped without error

#### Scenario: No matching elements
- **WHEN** `hydrateIslands("[data-island]", registry)` is called but no elements match the selector
- **THEN** an empty array SHALL be returned
