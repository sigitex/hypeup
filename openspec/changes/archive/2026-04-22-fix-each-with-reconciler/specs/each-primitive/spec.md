## MODIFIED Requirements

### Requirement: Structural change detection
`each()` SHALL create an outer effect that tracks the reactive array's structural identity (length, item references). When items are added, removed, swapped, or the array is replaced, the outer effect SHALL re-run and dispatch to the keyed reconciler. Additionally, `mountEach()` SHALL support external item updates — when the `Each` node's items are replaced by the mount system (due to thunk re-evaluation), the structural effect SHALL reconcile the new items against the existing keyed item state.

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
- **THEN** the structural effect SHALL reconcile the new items against the existing keyed item state, reusing DOM nodes for matching keys and only creating/removing nodes as needed

#### Scenario: External item update from thunk re-evaluation
- **WHEN** the mount system updates `eachNode.items` to a new array reference (due to thunk re-run)
- **THEN** the structural effect SHALL re-run and reconcile the new items against `currentItems`, producing minimal DOM mutations
