## MODIFIED Requirements

### Requirement: Slot-level diffing compares classified args
During redraw, the differ SHALL walk the new vdom element's args in parallel with the previous mount's recorded slot list. Each new arg SHALL be classified and compared against the corresponding previous slot's classification. Additionally, `Lazy` nodes SHALL be handled as a distinct slot kind with function-reference and arg-comparison-based skip logic.

#### Scenario: Lazy slot unchanged
- **WHEN** the previous slot is `kind: "lazy"` with `fn: F, args: [a, b]` and the new arg is a `Lazy` node with `fn: F, args: [a, b]` where all references are `===`
- **THEN** no function call and no DOM operations SHALL be performed for that slot

#### Scenario: Lazy slot args changed
- **WHEN** the previous slot is `kind: "lazy"` with `fn: F, args: [a, false]` and the new `Lazy` has `fn: F, args: [a, true]`
- **THEN** `F(a, true)` SHALL be called and the result diffed against the stored MountHandle

#### Scenario: Lazy to non-lazy transition
- **WHEN** the previous slot was `kind: "lazy"` and the new arg classifies as a different kind (e.g., text)
- **THEN** the lazy MountHandle SHALL be disposed and the new value applied

#### Scenario: Non-lazy to lazy transition
- **WHEN** the previous slot was a non-lazy kind and the new arg is a `Lazy` node
- **THEN** the old slot SHALL be undone and the Lazy node mounted fresh
