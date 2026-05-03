## ADDED Requirements

### Requirement: List reconciliation for child arrays (Phase 2)
When both old and new values from a signal are arrays of child elements, the runtime SHALL dispatch to a list reconciler instead of full undo/redo. Phase 1 SHALL use full-list replacement.

#### Scenario: Phase 1 full-list replace
- **WHEN** a signal holding `[elem("li", ["a"]), elem("li", ["b"])]` changes to `[elem("li", ["a"]), elem("li", ["c"])]`
- **THEN** in Phase 1, all old child nodes SHALL be removed and all new child nodes SHALL be mounted and appended

#### Scenario: Phase 2 keyed reconciliation (future)
- **WHEN** Phase 2 list reconciliation is implemented
- **THEN** unchanged children SHALL be reused and only changed/added/removed children SHALL be updated in the DOM
