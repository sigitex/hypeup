## Why

When `each()` is used inside a babel-plugin thunk (which is always the case in practice), reassigning the source array destroys the keyed reconciler and rebuilds all DOM nodes from scratch. The reconciler never gets to diff — it always starts with an empty previous-items list. This makes `each()` behave as non-keyed for any operation that replaces the array reference, even when most items are unchanged (e.g., swapping two rows requires destroying and recreating 1000 nodes instead of moving 2).

## What Changes

- `processArg()` in `mount.ts` gains special handling for thunks that return `Each` — instead of the generic teardown/rebuild cycle, it detects when a thunk previously produced an `Each` and updates the existing reconciler's items in place
- `mountEach()` in `each.ts` gains the ability to accept updated items on an already-mounted `Each`, re-running the structural reconciliation against the existing keyed item state rather than starting from empty
- The `Each` vdom node may gain a mutable `items` setter or an update mechanism to support feeding new items into an existing mount
- Users no longer need to use array mutations as a workaround — both reassignment and mutation produce efficient keyed reconciliation

## Capabilities

### New Capabilities

- `each-thunk-reconciler-reuse`: Thunk-wrapped `each()` calls preserve the reconciler across re-evaluations, enabling proper keyed diffing on array reassignment

### Modified Capabilities

- `client-mount`: Thunk processing in `processArg()` gains `Each`-aware re-evaluation (no teardown when thunk returns a new `Each` with same structure)
- `each-primitive`: Structural change detection must handle items being replaced externally (from thunk re-evaluation) in addition to reactive proxy tracking

## Impact

- **`client/src/mount.ts`** — `processArg()` thunk handling modified to detect and special-case `Each` return values
- **`client/src/each.ts`** — `mountEach()` modified to support updating items on an existing mount; `Each` class or mount state gains an update path
- **`@hypeup/vdom`** — `Each` class may need a minor addition (e.g., mutable items property) if not already mutable
- **Benchmarks** — swap-rows, remove-row, update-every-10th, and append operations should all perform correctly with idiomatic reassignment patterns (no more mutation workarounds needed)
- **No breaking changes** — mutation-based patterns continue to work identically; this is purely additive behavior
