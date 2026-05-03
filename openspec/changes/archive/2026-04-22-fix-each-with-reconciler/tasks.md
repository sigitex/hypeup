## 1. Modify mountEach to support external item updates

- [x] 1.1 Refactor `mountEach()` in `client/src/each.ts` to return `{ dispose, update }` instead of a plain `Undo` function. The `update(newEach: Each)` method replaces `eachNode.items`, `eachNode.keyFn`, and `eachNode.mapFn` on the existing `Each` node, triggering the structural effect to re-run and reconcile against `currentItems`.
- [x] 1.2 Define a `MountedEach` type (or inline object type) for the `{ dispose, update }` return value.
- [x] 1.3 Ensure the outer structural effect in `mountEach` reads from `eachNode.items` (the mutable property) so that updating it and re-running the effect produces a proper diff against existing `currentItems`.

## 2. Special-case Each in processArg thunk handling

- [x] 2.1 Modify the thunk branch in `processArg()` in `client/src/mount.ts` to track whether the previous thunk evaluation produced an `Each` (store a reference to the `MountedEach` handle).
- [x] 2.2 When the thunk re-evaluates and returns a new `Each`: check if `keyFn` and `mapFn` references match the previous `Each`. If they match, call `mountedEach.update(newEach)` instead of tearing down. If they differ, fall back to full teardown/rebuild.
- [x] 2.3 When the thunk re-evaluates and the type transitions (was `Each` now non-`Each`, or vice versa), fall back to the existing teardown/rebuild path.
- [x] 2.4 Update the non-Each thunk path to clear the `MountedEach` reference when transitioning away from an `Each`.

## 3. Update internal call sites

- [x] 3.1 Update the direct `mountEach()` call in `processArg()` (the non-thunk `Each` branch at line 36-38) to handle the new return type — extract the `dispose` function for the disposers array.
- [x] 3.2 Update `applyResolved()` (line 80-81) where it calls `mountEach()` for classified `Each` values — extract `dispose` from the returned object.

## 4. Tests

- [x] 4.1 Add test: thunk-wrapped `each()` with array reassignment reuses DOM nodes for matching keys (swap scenario — verify only moved nodes, not full rebuild).
- [x] 4.2 Add test: thunk-wrapped `each()` with array reassignment properly removes/adds nodes for changed keys (append/remove scenarios).
- [x] 4.3 Add test: thunk type transition from `Each` to non-`Each` tears down reconciler and applies new value.
- [x] 4.4 Add test: thunk type transition from non-`Each` to `Each` mounts fresh reconciler.
- [x] 4.5 Add test: mutation-based updates (`push`, `splice`, index assignment) still work correctly with thunk-wrapped `each()`.
- [x] 4.6 Add test: `keyFn` reference change triggers full teardown/rebuild.

## 5. Verify benchmarks

- [x] 5.1 Update the benchmark store (`hypeup-bench`) to use idiomatic reassignment for swap/remove/update operations (remove mutation workarounds) and verify correct behavior.
- [ ] 5.2 Run the js-framework-benchmark suite and confirm performance is on par with the mutation-based approach.
