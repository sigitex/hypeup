## MODIFIED Requirements

### Requirement: mount accepts a component function and returns a redraw handle
`mount(root, componentFn)` SHALL accept a root DOM element and a component function. It SHALL invoke the component function, mount the resulting vdom into the root element, record the slot state for diffing, and return a handle with `redraw()` and `dispose()` methods. The mount system SHALL additionally handle `Lazy` vdom nodes by calling their function, mounting the result, and storing a `MountHandle` for future arg-comparison-based skipping. On `dispose()`, all `onremove` callbacks in the tree SHALL be fired before DOM removal.

#### Scenario: Initial mount
- **WHEN** `mount(root, () => div("hello"))` is called
- **THEN** a `<div>` with text `"hello"` SHALL be appended to `root`
- **AND** the returned handle SHALL have `redraw()` and `dispose()` methods

#### Scenario: Redraw via handle
- **WHEN** `handle.redraw()` is called after state changes
- **THEN** the component function SHALL be re-invoked and the DOM SHALL be patched via slot diffing

#### Scenario: Dispose removes DOM and cleans up
- **WHEN** `handle.dispose()` is called
- **THEN** all `onremove` callbacks in the tree SHALL be fired
- **AND** the mounted DOM SHALL be removed from the root element
- **AND** subsequent `redraw()` calls SHALL be no-ops

#### Scenario: Initial mount with Lazy child
- **WHEN** mounting a vdom tree that contains a `Lazy` node as a child
- **THEN** the Lazy node's function SHALL be called with its args, the result mounted, and the MountHandle stored in a `lazy` SlotRecord

#### Scenario: Redraw with unchanged Lazy args
- **WHEN** a redraw produces a `Lazy` node with the same function and `===` args as the previous render
- **THEN** the Lazy subtree SHALL be skipped entirely — no function call, no diff

#### Scenario: Redraw with changed Lazy args
- **WHEN** a redraw produces a `Lazy` node with the same function but different args
- **THEN** the function SHALL be called with the new args, and the result SHALL be diffed against the stored MountHandle

#### Scenario: mountElement fires oncreate callbacks
- **WHEN** `mountElement` finishes processing all content args for an element
- **THEN** any `oncreate` slot callbacks SHALL be fired with the element after all other slots have been applied
