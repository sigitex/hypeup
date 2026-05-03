## ADDED Requirements

### Requirement: redraw() re-runs component and patches DOM
The `redraw()` function SHALL re-invoke the root component function to produce a new vdom tree, diff it against the previous mount state, and apply targeted DOM mutations for any differences.

#### Scenario: Manual redraw after state change
- **WHEN** user code mutates state and calls `redraw()`
- **THEN** the component function SHALL be re-invoked, the new vdom SHALL be diffed against the previous, and only changed slots SHALL produce DOM mutations

#### Scenario: No changes produces no DOM mutations
- **WHEN** `redraw()` is called but no state has changed
- **THEN** the diff SHALL detect all slots are identical and perform zero DOM operations

### Requirement: Auto-redraw after event handlers
Event handlers registered via `on(event, handler)` SHALL automatically call `redraw()` after the handler executes. This ensures interactive updates require no boilerplate.

#### Scenario: Click handler triggers redraw
- **WHEN** a user clicks a button with `on("click", () => state.count++)`
- **THEN** the handler SHALL execute, then `redraw()` SHALL be called automatically, updating any DOM that depends on `state.count`

### Requirement: Silent event handlers skip redraw
`on.silent(event, handler)` SHALL execute the handler WITHOUT triggering an automatic redraw. This is for handlers that don't affect UI state (analytics, logging).

#### Scenario: Silent handler does not redraw
- **WHEN** a user clicks an element with `on.silent("click", trackAnalytics)`
- **THEN** the handler SHALL execute but `redraw()` SHALL NOT be called

### Requirement: redraw is a global helper
`redraw` SHALL be declared as a global by the lexicon, available without import in any user code -- just like `div`, `className`, `on`, and other DSL primitives. The babel plugin SHALL rewrite `redraw()` calls to the namespaced client import.

#### Scenario: Global redraw in fetch callback
- **WHEN** user code calls `redraw()` inside a fetch `.then()` without importing it
- **THEN** the call SHALL resolve to the client's redraw function and trigger a re-render

### Requirement: Manual redraw for async operations
`redraw()` SHALL be callable from any context -- fetch callbacks, setTimeout, requestAnimationFrame, etc. -- to trigger a UI update after async state changes.

#### Scenario: Fetch callback triggers redraw
- **WHEN** a fetch completes and the callback calls `state.data = result; redraw()`
- **THEN** the component SHALL re-render with the new data
