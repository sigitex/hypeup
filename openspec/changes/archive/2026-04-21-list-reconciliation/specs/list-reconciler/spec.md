## ADDED Requirements

### Requirement: Keyed list reconciliation algorithm
The reconciler SHALL accept an old list of keyed entries (key + DOM node + dispose function) and a new list of keys, and produce minimal DOM mutations (insertions, removals, moves) to transform the old DOM order into the new order. The algorithm SHALL use the longest-increasing-subsequence (LIS) approach to minimize the number of DOM move operations.

#### Scenario: Append items to end
- **WHEN** old keys are `[1, 2, 3]` and new keys are `[1, 2, 3, 4, 5]`
- **THEN** the reconciler SHALL insert new DOM nodes for keys `4` and `5` after key `3`, with zero moves of existing nodes

#### Scenario: Remove items from middle
- **WHEN** old keys are `[1, 2, 3, 4, 5]` and new keys are `[1, 3, 5]`
- **THEN** the reconciler SHALL remove DOM nodes for keys `2` and `4` and call their dispose functions, with zero moves of remaining nodes

#### Scenario: Swap two items
- **WHEN** old keys are `[1, 2, 3, 4, 5]` and new keys are `[1, 4, 3, 2, 5]`
- **THEN** the reconciler SHALL reorder DOM nodes for keys `2` and `4` using minimal move operations (at most 2 moves via LIS)

#### Scenario: Full replacement
- **WHEN** old keys are `[1, 2, 3]` and new keys are `[4, 5, 6]`
- **THEN** the reconciler SHALL remove all old DOM nodes (calling dispose for each), and signal that all new keys require mounting

#### Scenario: Empty to populated
- **WHEN** old keys are `[]` and new keys are `[1, 2, 3]`
- **THEN** the reconciler SHALL signal that all new keys require mounting, with no removals or moves

#### Scenario: Populated to empty
- **WHEN** old keys are `[1, 2, 3]` and new keys are `[]`
- **THEN** the reconciler SHALL remove all DOM nodes and call all dispose functions

#### Scenario: Reverse order
- **WHEN** old keys are `[1, 2, 3, 4, 5]` and new keys are `[5, 4, 3, 2, 1]`
- **THEN** the reconciler SHALL reorder DOM nodes using at most 4 move operations (LIS length 1, so n-1 moves)

#### Scenario: Single item moved
- **WHEN** old keys are `[1, 2, 3, 4, 5]` and new keys are `[2, 3, 4, 5, 1]`
- **THEN** the reconciler SHALL move key `1` to the end with exactly 1 DOM move operation (LIS covers keys 2-5)

### Requirement: Reconciler disposes removed items
When items are removed during reconciliation, the reconciler SHALL call the dispose function for each removed item. The dispose function SHALL clean up effects and remove the DOM node.

#### Scenario: Removed item effects cleaned up
- **WHEN** a keyed item with active effects is removed during reconciliation
- **THEN** the item's dispose function SHALL be called, stopping all reactive tracking for that item

### Requirement: Reconciler preserves surviving item state
Items whose keys persist across a reconciliation SHALL retain their DOM nodes and active effects. The reconciler SHALL NOT remount or re-run effects for surviving items — only their DOM position may change.

#### Scenario: Surviving item retains DOM node
- **WHEN** old keys are `[1, 2, 3]` and new keys are `[3, 1, 2]`
- **THEN** the DOM nodes for keys `1`, `2`, and `3` SHALL be the same object references as before reconciliation (moved, not recreated)

#### Scenario: Surviving item effects continue
- **WHEN** an item with key `1` has a per-item effect tracking `item.label`, and reconciliation moves key `1` to a new position
- **THEN** the effect SHALL continue to fire when `item.label` changes, without re-subscription
