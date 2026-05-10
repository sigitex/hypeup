## MODIFIED Requirements

### Requirement: Slot-level diffing compares classified args
During redraw, the differ SHALL walk the new vdom element's args in parallel with the previous mount's recorded slot list. Each new arg SHALL be classified and compared against the corresponding previous slot's classification. `Lazy` nodes SHALL be handled as a distinct slot kind with function-reference and arg-comparison-based logic. For factory Lazy slots, the slot record SHALL additionally store the view function.

#### Scenario: Lazy slot unchanged (pure component)
- **WHEN** the previous slot is `kind: "lazy"` (pure) with `fn: F, args: [a, b]` and the new arg is a `Lazy` node with `fn: F, args: [a, b]` where all references are `===`
- **THEN** no function call and no DOM operations SHALL be performed for that slot

#### Scenario: Lazy slot unchanged (factory component)
- **WHEN** the previous slot is `kind: "lazy"` (factory) with `fn: F, args: [a]` and stored `viewFn`, and the new `Lazy` has `fn: F, args: [a]` where references are `===`
- **THEN** the factory SHALL NOT be re-invoked
- **AND** the stored `viewFn` SHALL be called and the result diffed against the previous MountHandle

#### Scenario: Lazy slot args changed (pure component)
- **WHEN** the previous slot is `kind: "lazy"` (pure) with `fn: F, args: [a, false]` and the new `Lazy` has `fn: F, args: [a, true]`
- **THEN** `F(a, true)` SHALL be called and the result diffed against the stored MountHandle

#### Scenario: Lazy slot args changed (factory component)
- **WHEN** the previous slot is `kind: "lazy"` (factory) with `fn: F, args: [itemA]` and the new `Lazy` has `fn: F, args: [itemB]` where `itemA !== itemB`
- **THEN** the factory `F(itemB)` SHALL be called, the new view function stored, the new view called, and the result diffed against the previous MountHandle

#### Scenario: Lazy to non-lazy transition
- **WHEN** the previous slot was `kind: "lazy"` and the new arg classifies as a different kind (e.g., text)
- **THEN** the lazy MountHandle SHALL be disposed and the new value applied

#### Scenario: Non-lazy to lazy transition
- **WHEN** the previous slot was a non-lazy kind and the new arg is a `Lazy` node
- **THEN** the old slot SHALL be undone and the Lazy node mounted fresh
