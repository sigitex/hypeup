## MODIFIED Requirements

### Requirement: Lazy vdom node defers component evaluation
The `Lazy` vdom node SHALL store a component function reference and its arguments without calling the function. The runtime SHALL call the function on first mount and inspect the result: if the result is a **function**, the runtime SHALL treat it as a factory component — storing the returned view function, calling it to produce an Element, and mounting that Element. If the result is an Element, the runtime SHALL mount it directly (existing behavior). In both cases, the MountHandle SHALL be stored for future diffing.

#### Scenario: Lazy node mounted for the first time (pure component)
- **WHEN** a `Lazy` node with `fn: TodoRow` and `args: [todo, false]` is mounted and `TodoRow(todo, false)` returns an Element
- **THEN** the runtime SHALL mount the resulting Element and store the MountHandle

#### Scenario: Lazy node mounted for the first time (factory component)
- **WHEN** a `Lazy` node with `fn: Counter` and `args: [0]` is mounted and `Counter(0)` returns a function
- **THEN** the runtime SHALL store the returned function as the view, call it to produce an Element, mount the Element, and store the MountHandle

### Requirement: Lazy node skips when args are unchanged
On redraw, the differ SHALL shallow-compare (`===`) each argument of a `Lazy` node against the previous arguments. For **pure** Lazy nodes: if all arguments match AND the function reference is the same, the component function SHALL NOT be called and the subtree SHALL NOT be diffed. For **factory** Lazy nodes: if all arguments match AND the function reference is the same, the factory SHALL NOT be re-invoked, but the stored view function SHALL be called and the result diffed against the previous MountHandle.

#### Scenario: Same function, same args — skip (pure component)
- **WHEN** the previous `Lazy` had `fn: TodoRow, args: [todo, false]` and the new `Lazy` has `fn: TodoRow, args: [todo, false]` where both `todo` references are `===`
- **THEN** the component function SHALL NOT be called and zero DOM operations SHALL occur

#### Scenario: Same function, same args — view called (factory component)
- **WHEN** the previous `Lazy` was a factory with `fn: Counter, args: [0]` and the new `Lazy` has `fn: Counter, args: [0]` where references are `===`
- **THEN** the factory SHALL NOT be re-invoked
- **AND** the stored view function SHALL be called and the result diffed against the previous DOM

#### Scenario: Same function, different args — re-run and diff
- **WHEN** the previous `Lazy` had `fn: TodoRow, args: [todo, false]` and the new `Lazy` has `fn: TodoRow, args: [todo, true]`
- **THEN** the component function SHALL be called with the new args, and the result SHALL be diffed against the previous MountHandle

#### Scenario: Different function — dispose and remount
- **WHEN** the previous `Lazy` had `fn: TodoRow` and the new `Lazy` has `fn: AdminRow`
- **THEN** the previous MountHandle SHALL be disposed and the new function SHALL be called and mounted fresh

### Requirement: lazy() runtime function creates Lazy nodes
The `lazy(fn, args)` function SHALL return a `Lazy` vdom node. This function is called by babel-generated code, not by users directly.

#### Scenario: lazy() returns Lazy node
- **WHEN** `lazy(TodoRow, [todo, isSelected])` is called
- **THEN** a `Lazy` node SHALL be returned with `fn: TodoRow` and `args: [todo, isSelected]`

### Requirement: Shallow comparison uses strict equality
Argument comparison SHALL use `===` for each argument position. No deep comparison SHALL be performed.

#### Scenario: Object identity determines equality
- **WHEN** the previous arg was object `A` and the new arg is a different object `B` with identical properties
- **THEN** the args SHALL be considered different and the component SHALL re-run
