## ADDED Requirements

### Requirement: each() signature and return type
`each(items, keyFn, mapFn)` SHALL accept a reactive array (or signal holding an array), a key extraction function `(item) => key`, and a mapping function `(item, index) => Element`. It SHALL return an `Each` vdom type that can appear anywhere a child element can in hypeup's DSL.

#### Scenario: Basic each usage with key function
- **WHEN** `each(state.todos, t => t.id, t => li(t.label))` is called
- **THEN** it SHALL return an `Each` containing the items reference, key function, and map function

#### Scenario: each composable in element contents
- **WHEN** `ul(each(state.items, i => i.id, i => li(i.name)))` is called
- **THEN** the `Each` SHALL be accepted as a valid child of the `ul` element

### Requirement: each() two-argument overload
`each(items, mapFn)` SHALL be accepted as a shorthand where no key function is provided. When the key function is omitted, `each()` SHALL default to using the array index as the key. This produces non-keyed (index-based) reconciliation — DOM nodes are reused positionally rather than by identity.

#### Scenario: Two-argument each usage
- **WHEN** `each(state.items, i => li(i.name))` is called with two arguments
- **THEN** it SHALL return an `Each` with the key function defaulting to `(_, index) => index`

#### Scenario: Index-based keying reuses nodes positionally
- **WHEN** a two-argument `each()` list has its first item removed (items shift left)
- **THEN** the reconciler SHALL treat it as index-based: item at index 0 gets new data, item at index 1 gets new data, etc., and the last DOM node is removed

### Requirement: Per-item reactive scopes
`each()` SHALL create an independent reactive scope (effect) for each item in the list. When a reactive property within a single item changes, only that item's effect SHALL re-run. Other items' effects SHALL NOT be affected.

#### Scenario: Single item label update
- **WHEN** a list of 1000 items is rendered via `each()` and `items[500].label` is mutated
- **THEN** only item 500's mapping effect SHALL re-run and update its DOM text node; the other 999 items SHALL NOT re-render

#### Scenario: Multiple item updates in batch
- **WHEN** `batch(() => { items[0].label += "!"; items[10].label += "!"; items[20].label += "!" })` is called
- **THEN** exactly 3 per-item effects SHALL re-run after the batch completes

### Requirement: Structural change detection
`each()` SHALL create an outer effect that tracks the reactive array's structural identity (length, item references). When items are added, removed, swapped, or the array is replaced, the outer effect SHALL re-run and dispatch to the keyed reconciler.

#### Scenario: Item appended
- **WHEN** `state.items.push(newItem)` is called on a reactive array rendered via `each()`
- **THEN** the outer effect SHALL detect the structural change and the reconciler SHALL insert a new DOM node for the appended item

#### Scenario: Item removed
- **WHEN** `state.items.splice(idx, 1)` is called
- **THEN** the outer effect SHALL detect the structural change and the reconciler SHALL remove the corresponding DOM node and dispose its effects

#### Scenario: Items swapped
- **WHEN** items at indices 1 and 998 are swapped in a 1000-item reactive array
- **THEN** the outer effect SHALL detect the structural change and the reconciler SHALL move the two DOM nodes with minimal operations

#### Scenario: Array replaced entirely
- **WHEN** `state.items = buildNewArray(1000)` replaces the entire array
- **THEN** the outer effect SHALL detect the new array reference, the reconciler SHALL remove all old items and mount all new items

### Requirement: Item value changes do not trigger reconciliation
When only item properties change (not the array structure), the reconciler SHALL NOT run. Only per-item effects SHALL handle the update.

#### Scenario: Label change does not reconcile
- **WHEN** `items[5].label = "new label"` is set on a reactive item in an `each()` list
- **THEN** the per-item effect for item 5 SHALL re-run, but the outer structural effect SHALL NOT re-run and the reconciler SHALL NOT be invoked

### Requirement: each() cleanup on dispose
When a parent element containing an `each()` is disposed, all per-item effects and the outer structural effect SHALL be disposed. Subsequent mutations to the reactive array SHALL NOT trigger DOM updates.

#### Scenario: Full cleanup on parent dispose
- **WHEN** a mounted element containing `each(state.items, ...)` is disposed
- **THEN** all per-item effects and the structural effect SHALL be cleaned up
- **AND** mutating `state.items` SHALL NOT cause errors or DOM updates

### Requirement: Empty list handling
`each()` SHALL handle empty arrays. When the array starts empty, no DOM nodes SHALL be created. When the array transitions to empty, all DOM nodes SHALL be removed and effects disposed.

#### Scenario: Initial empty array
- **WHEN** `each(state.items, ...)` is mounted with `state.items = []`
- **THEN** no child DOM nodes SHALL be created in the parent element

#### Scenario: Transition to empty
- **WHEN** a non-empty `each()` list has its array set to `[]`
- **THEN** all child DOM nodes SHALL be removed and all per-item effects SHALL be disposed
