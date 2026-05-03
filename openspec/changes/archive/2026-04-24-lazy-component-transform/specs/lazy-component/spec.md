## ADDED Requirements

### Requirement: Lazy vdom node defers component evaluation
The `Lazy` vdom node SHALL store a component function reference and its arguments without calling the function. The runtime SHALL call the function on first mount and store the resulting MountHandle for future diffing.

#### Scenario: Lazy node mounted for the first time
- **WHEN** a `Lazy` node with `fn: TodoRow` and `args: [todo, false]` is mounted
- **THEN** the runtime SHALL call `TodoRow(todo, false)`, mount the resulting Element, and store the MountHandle

### Requirement: Lazy node skips when args are unchanged
On redraw, the differ SHALL shallow-compare (`===`) each argument of a `Lazy` node against the previous arguments. If all arguments match AND the function reference is the same, the component function SHALL NOT be called and the subtree SHALL NOT be diffed.

#### Scenario: Same function, same args — skip
- **WHEN** the previous `Lazy` had `fn: TodoRow, args: [todo, false]` and the new `Lazy` has `fn: TodoRow, args: [todo, false]` where both `todo` references are `===`
- **THEN** the component function SHALL NOT be called and zero DOM operations SHALL occur

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
