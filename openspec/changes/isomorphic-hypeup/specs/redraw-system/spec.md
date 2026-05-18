## MODIFIED Requirements

### Requirement: redraw() re-runs component and patches DOM
The `redraw()` function SHALL iterate all registered root redraw functions, re-invoking each root's component function to produce a new vdom tree, diffing it against the previous mount state, and applying targeted DOM mutations for any differences. The registry SHALL be snapshotted before iteration to avoid issues if a redraw causes a mount or dispose.

#### Scenario: Manual redraw after state change
- **WHEN** user code mutates state and calls `redraw()`
- **THEN** all registered root component functions SHALL be re-invoked, each new vdom SHALL be diffed against the previous, and only changed slots SHALL produce DOM mutations

#### Scenario: No changes produces no DOM mutations
- **WHEN** `redraw()` is called but no state has changed in any root
- **THEN** the diff SHALL detect all slots are identical and perform zero DOM operations

#### Scenario: Multiple roots redrawn
- **WHEN** two roots are mounted/hydrated and `redraw()` is called
- **THEN** both roots SHALL be re-rendered and diffed independently

### Requirement: Auto-redraw after event handlers is root-scoped
Event handlers registered via `on(event, handler)` SHALL automatically trigger a redraw of the owning root after the handler executes. The auto-redraw SHALL be scoped to the root that mounted/hydrated the element, NOT a global redraw of all roots.

#### Scenario: Click handler triggers scoped redraw
- **WHEN** a user clicks a button with `on("click", () => state.count++)` inside island A
- **THEN** the handler SHALL execute, then only island A's root SHALL be redrawn

#### Scenario: Auto-redraw does not affect other roots
- **WHEN** island A and island B are both hydrated, and a click occurs in island A
- **THEN** island B SHALL NOT be redrawn by the auto-redraw

### Requirement: Silent event handlers skip redraw
`on.silent(event, handler)` SHALL execute the handler WITHOUT triggering an automatic redraw. This is for handlers that don't affect UI state (analytics, logging).

#### Scenario: Silent handler does not redraw
- **WHEN** a user clicks an element with `on.silent("click", trackAnalytics)`
- **THEN** the handler SHALL execute but no redraw SHALL occur

### Requirement: redraw is a global helper
`redraw` SHALL be declared as a global by the lexicon, available without import in any user code -- just like `div`, `className`, `on`, and other DSL primitives. The babel plugin SHALL rewrite `redraw()` calls to the namespaced client import.

#### Scenario: Global redraw in fetch callback
- **WHEN** user code calls `redraw()` inside a fetch `.then()` without importing it
- **THEN** the call SHALL resolve to the client's redraw function and trigger a re-render of all registered roots

### Requirement: Manual redraw for async operations
`redraw()` SHALL be callable from any context -- fetch callbacks, setTimeout, requestAnimationFrame, etc. -- to trigger a UI update after async state changes. It SHALL redraw all registered roots.

#### Scenario: Fetch callback triggers redraw
- **WHEN** a fetch completes and the callback calls `state.data = result; redraw()`
- **THEN** all registered root components SHALL re-render with the new data

### Requirement: Redraw target registry supports multiple roots
The redraw system SHALL maintain a registry (set) of root redraw functions. `mount()` and `hydrate()` SHALL register their root's redraw function on creation. `dispose()` SHALL unregister it. The registry SHALL replace the previous single-target `currentRedraw` singleton.

#### Scenario: Mount registers redraw target
- **WHEN** `mount(root, componentFn)` is called
- **THEN** the root's redraw function SHALL be added to the registry

#### Scenario: Dispose unregisters redraw target
- **WHEN** `handle.dispose()` is called
- **THEN** the root's redraw function SHALL be removed from the registry
- **AND** subsequent global `redraw()` calls SHALL NOT invoke the disposed root

#### Scenario: Multiple mounts coexist
- **WHEN** `mount()` is called twice with different roots
- **THEN** both redraw functions SHALL be in the registry and both SHALL execute on global `redraw()`
