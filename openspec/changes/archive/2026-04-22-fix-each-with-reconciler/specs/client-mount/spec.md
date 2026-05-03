## MODIFIED Requirements

### Requirement: mount handles reactive arguments
When a thunk (function) is encountered during mount, `mount()` SHALL evaluate it inside an `effect()`. Reactive property reads during evaluation SHALL be tracked. When tracked properties change, the effect SHALL re-run. For thunks that return `Each` objects, the mount system SHALL reuse the existing reconciler instead of tearing down and rebuilding — updating the `Each` node's items and letting the structural effect reconcile. For all other thunk return types, the effect SHALL undo the previous DOM state and apply the new value. Signal passthrough via `isSignal()` SHALL be preserved as a backward-compatible fallback.

#### Scenario: Thunk evaluated inside effect
- **WHEN** `mount(elem("div", [() => state.name]))` is called where `state` is reactive
- **THEN** the text child SHALL display the current value of `state.name`

#### Scenario: Thunk re-evaluates on reactive change
- **WHEN** `state.name` changes from `"bob"` to `"jane"`
- **THEN** the text child SHALL update from `"bob"` to `"jane"` via undo/redo

#### Scenario: Thunk with conditional expression
- **WHEN** `mount(elem("li", [() => state.active && new CssClass("active")]))` is called and `state.active` changes from `true` to `false`
- **THEN** the `"active"` class SHALL be removed from the element

#### Scenario: Signal passthrough still works
- **WHEN** `mount(elem("div", [signal("hello")]))` is called and the signal later changes to `"world"`
- **THEN** the text child SHALL update from `"hello"` to `"world"`

#### Scenario: Static thunk runs once
- **WHEN** `mount(elem("div", [() => "static text"]))` is called
- **THEN** the thunk SHALL evaluate once and the effect SHALL NOT re-run (no reactive dependencies)

#### Scenario: Thunk returning Each reuses reconciler
- **WHEN** a thunk returns `each(state.items, ...)` and `state.items` is reassigned to a new array
- **THEN** the thunk effect SHALL detect the existing `Each` mount, update its items, and let the structural effect reconcile — without tearing down and rebuilding
