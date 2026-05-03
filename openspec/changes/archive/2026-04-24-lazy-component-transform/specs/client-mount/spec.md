## MODIFIED Requirements

### Requirement: mount accepts a component function and returns a redraw handle
`mount(root, componentFn)` SHALL accept a root DOM element and a component function. It SHALL invoke the component function, mount the resulting vdom into the root element, record the slot state for diffing, and return a handle with `redraw()` and `dispose()` methods. The mount system SHALL additionally handle `Lazy` vdom nodes by calling their function, mounting the result, and storing a `MountHandle` for future arg-comparison-based skipping.

#### Scenario: Initial mount with Lazy child
- **WHEN** mounting a vdom tree that contains a `Lazy` node as a child
- **THEN** the Lazy node's function SHALL be called with its args, the result mounted, and the MountHandle stored in a `lazy` SlotRecord

#### Scenario: Redraw with unchanged Lazy args
- **WHEN** a redraw produces a `Lazy` node with the same function and `===` args as the previous render
- **THEN** the Lazy subtree SHALL be skipped entirely — no function call, no diff

#### Scenario: Redraw with changed Lazy args
- **WHEN** a redraw produces a `Lazy` node with the same function but different args
- **THEN** the function SHALL be called with the new args, and the result SHALL be diffed against the stored MountHandle
