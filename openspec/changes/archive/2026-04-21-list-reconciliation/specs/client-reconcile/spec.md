## MODIFIED Requirements

### Requirement: List reconciliation for child arrays (Phase 2)
When both old and new values from an `each()` primitive are arrays of child elements, the runtime SHALL dispatch to the keyed list reconciler (Ivi's LIS-based algorithm) instead of full undo/redo. Plain arrays (not produced by `each()`) SHALL continue to use full-list replacement via undo/redo. The reconciler SHALL produce minimal DOM mutations: insertions for new keys, removals (with dispose) for missing keys, and positional moves for reordered keys.

#### Scenario: Phase 1 full-list replace for plain arrays
- **WHEN** a thunk returns a plain array `[elem("li", ["a"]), elem("li", ["b"])]` that changes to `[elem("li", ["a"]), elem("li", ["c"])]`
- **THEN** all old child nodes SHALL be removed and all new child nodes SHALL be mounted and appended (undo/redo behavior preserved)

#### Scenario: Phase 2 keyed reconciliation via each()
- **WHEN** an `each()` primitive detects a structural change in its reactive array
- **THEN** the keyed reconciler SHALL be invoked to compute minimal DOM mutations
- **AND** unchanged children SHALL retain their DOM nodes and active effects
- **AND** only added, removed, or moved children SHALL be mutated in the DOM
