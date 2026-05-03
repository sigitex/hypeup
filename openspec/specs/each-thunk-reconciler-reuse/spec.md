## ADDED Requirements

### Requirement: Thunk-wrapped each() preserves reconciler on array reassignment
When a thunk re-evaluates and produces a new `Each` object (due to source array reassignment), the mount system SHALL reuse the existing reconciler state rather than tearing down and rebuilding. The new items SHALL be diffed against the previous keyed item list, producing minimal DOM mutations.

#### Scenario: Swap two rows via reassignment
- **WHEN** a 1000-item `each()` list has its source array reassigned with two rows swapped
- **THEN** the reconciler SHALL move exactly 2 DOM nodes (via LIS-based diffing), not destroy and recreate 1000 nodes

#### Scenario: Append via reassignment
- **WHEN** a 1000-item `each()` list has its source array reassigned to a 2000-item array where the first 1000 items are identical
- **THEN** the reconciler SHALL create 1000 new DOM nodes and move zero existing nodes

#### Scenario: Remove one item via reassignment
- **WHEN** a 1000-item `each()` list has its source array reassigned to a 999-item array missing one item
- **THEN** the reconciler SHALL remove 1 DOM node and dispose its effects, moving zero remaining nodes

#### Scenario: Update every 10th row via reassignment
- **WHEN** a 1000-item `each()` list has its source array reassigned with every 10th item replaced (same keys, new objects)
- **THEN** the reconciler SHALL detect no structural key changes and perform zero DOM moves; per-item effects SHALL handle the content updates

### Requirement: Thunk type transition falls back to teardown
When a thunk previously produced an `Each` but re-evaluates to a non-`Each` value (or vice versa), the mount system SHALL fall back to the standard teardown/rebuild behavior.

#### Scenario: Each replaced by text
- **WHEN** a thunk returns an `Each` on first evaluation and a string on second evaluation
- **THEN** the mount system SHALL dispose the existing reconciler and all keyed items, then apply the string as a text node

#### Scenario: Text replaced by Each
- **WHEN** a thunk returns a string on first evaluation and an `Each` on second evaluation
- **THEN** the mount system SHALL undo the text node and mount the `Each` fresh with `mountEach()`

### Requirement: Key/map function change triggers full rebuild
When a thunk produces a new `Each` with a different `keyFn` or `mapFn` reference than the previously mounted `Each`, the mount system SHALL tear down the existing reconciler and mount the new `Each` fresh.

#### Scenario: Key function changes
- **WHEN** a thunk returns `each(items, a => a.id, ...)` on first evaluation and `each(items, a => a.name, ...)` on second evaluation (different keyFn reference)
- **THEN** the mount system SHALL dispose the existing reconciler and mount the new `Each` from scratch

### Requirement: Mutation-based updates remain unaffected
The existing mutation-based update path (inner structural effect tracking reactive proxy reads) SHALL continue to work identically. The thunk-level `Each` reuse only applies when the thunk itself re-evaluates.

#### Scenario: Push still works
- **WHEN** `state.items.push(newItem)` is called on a reactive array rendered via thunk-wrapped `each()`
- **THEN** the inner structural effect SHALL detect the change and the reconciler SHALL insert the new item, without the thunk-level effect re-running

#### Scenario: Index mutation still works
- **WHEN** `state.items[5] = newItem` is called on a reactive array
- **THEN** the inner structural effect SHALL detect the key change at index 5 and reconcile, without the thunk-level effect re-running
