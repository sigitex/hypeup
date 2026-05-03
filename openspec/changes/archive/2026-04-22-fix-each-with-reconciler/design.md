## Context

The babel plugin wraps all call arguments in thunks. When `each(state.data, keyFn, mapFn)` appears inside an element, it becomes `() => each(state.data, keyFn, mapFn)`. The mount system's `processArg()` evaluates thunks inside an `effect()`, with a teardown/rebuild cycle: on re-run, it undoes the previous result and applies the new one.

This is correct for simple reactive values (text, classes, attributes), but destructive for `each()`. When `state.data` is reassigned, the thunk re-runs, producing a new `Each` object. The generic teardown destroys the previous reconciler (disposing all keyed items), then `mountEach()` starts fresh with an empty previous-items list — no diffing occurs.

The reconciler itself works correctly. The problem is one layer up: `processArg()` doesn't know that an `Each` can be updated in place rather than torn down and rebuilt.

## Goals / Non-Goals

**Goals:**
- Array reassignment produces the same efficient keyed reconciliation as array mutation
- No API changes — existing `each()` call sites work without modification
- Mutation-based patterns continue to work identically (the inner structural effect still handles those)
- The fix is contained to `processArg()` in `mount.ts` — no changes to the reconciler algorithm itself

**Non-Goals:**
- Changing the `each()` public API (no getter-function overload)
- Optimizing the reconciler algorithm (LIS-based diffing is already correct)
- Handling key function or map function changes across thunk re-evaluations (these are static references in practice)
- Supporting `each()` outside of thunk contexts (it already works correctly when not thunk-wrapped)

## Decisions

### Decision 1: Special-case `Each` in `processArg()` thunk handling (Option B from issue)

When a thunk returns an `Each` and the previous thunk evaluation also produced an `Each`, update the existing mounted reconciler's items instead of tearing down and rebuilding.

**Approach:** `processArg()` gains an `Each`-specific thunk branch. It tracks whether the current thunk has a live `mountEach` instance. On re-evaluation:
1. If the thunk previously produced an `Each` and the new result is also an `Each`, feed the new items into the existing reconciler (triggering a diff against the current keyed item state)
2. If the type changes (was `Each`, now something else, or vice versa), fall back to the existing teardown/rebuild path

**Why not Option A (getter function)?** Requires an API change and would break the existing `each()` signature or require overloads. The babel plugin already wraps arguments — the runtime should handle this transparently.

**Why not Option C (stable identity)?** Fragile heuristic. Function reference identity is unreliable across re-renders in some patterns.

### Decision 2: `mountEach` returns an updater function

`mountEach()` currently returns an `Undo` (dispose function). It will be modified to return an object with both `dispose()` and `update(items)` methods. The `update()` method replaces `eachNode.items` and manually triggers the structural reconciliation logic that currently lives inside the outer effect.

**Rationale:** The outer `effect()` inside `mountEach` already does exactly the right thing — it reads `eachNode.items`, computes keys, and reconciles. By making `eachNode.items` settable and re-running the reconciliation, we reuse the existing logic path without duplication.

**Implementation detail:** The outer effect in `mountEach` reads `eachNode.items`. When `processArg()` updates the items on the `Each` node and the effect re-runs, it will reconcile against `currentItems` (the existing keyed state) rather than an empty list. The key insight is that we skip the thunk-level teardown — the `mountEach` effect stays alive with its `currentItems` state intact.

### Decision 3: No changes to `Each` vdom class

`Each.items` is already a mutable public property. No changes needed to `@hypeup/vdom`. The `processArg()` code simply mutates `eachNode.items` on the existing `Each` instance to point at the new array, then lets the existing structural effect handle reconciliation.

## Risks / Trade-offs

- **[Risk] Key/map function changes across re-evaluations** — If a thunk changes the key function or map function (unlikely but possible), reusing the reconciler with the old functions would produce incorrect results. → Mitigation: Compare `keyFn` and `mapFn` references; if either changed, fall back to full teardown/rebuild.

- **[Risk] Double reconciliation on reassignment** — If the new array is also a reactive proxy, the structural effect could fire twice: once from the manual `update()` call, and once from reactive tracking on the new proxy. → Mitigation: The `processArg` thunk effect replaces the items and the inner effect handles it in one pass. Since the thunk-level effect no longer tears down the `Each`, and `mountEach`'s inner effect is the one doing reconciliation, there's only one reconciliation path.

- **[Trade-off] Slightly more complex `processArg()`** — The thunk handling gains a branch for `Each`. This is acceptable given the significant performance improvement and the fact that `Each` is already special-cased at the top of `processArg()` for the non-thunk path.
