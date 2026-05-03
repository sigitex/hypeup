## Context

hypeup's client runtime mounts vdom trees into real DOM via `mount()`. Each element argument is processed by `processArg()`, which wraps thunks (from the babel transform) in `effect()` calls. When a thunk re-runs, the old result is undone and the new result is applied — the "undo/redo" pattern.

For arrays of children, this means every item is removed and re-mounted on any change. The existing `client-reconcile` spec acknowledges this as Phase 1 and defers keyed reconciliation to Phase 2.

The current reactive system (`reactive()` with Proxy, `effect()`, `computed()`, `batch()`) is mature and handles fine-grained updates well for scalar values. The gap is specifically in list rendering — there is no mechanism to maintain per-item identity across re-renders or to compute minimal DOM mutations for structural list changes.

Key files:
- `client/src/mount.ts` — `processArg()` wraps thunks in effects, `applyResolved()` handles arrays at line 73-81
- `client/src/apply.ts` — `apply()` dispatches classified values to DOM operations, each returning an undo closure
- `client/src/classify.ts` — runtime type classification of heterogeneous argument lists
- `client/src/reactive.ts` — Proxy-based deep reactivity with per-property tracking
- `client/src/effect.ts` — effect/computed/batch primitives

## Goals / Non-Goals

**Goals:**
- Implement keyed list reconciliation that produces minimal DOM mutations (insert, remove, move) for structural changes
- Provide an `each()` primitive that creates per-item reactive scopes so item value changes bypass reconciliation entirely
- Maintain backward compatibility — existing array handling via undo/redo remains the default for plain arrays
- Enable competitive performance on js-framework-benchmark (create/replace/update/swap/remove/clear operations on 1,000-10,000 row tables)

**Non-Goals:**
- `reactiveList` primitive that emits structural ops (push/remove/swap) directly — deferred to a future phase per backlog
- Non-keyed list reconciliation — `each()` always requires a key function
- Server-side rendering support for `each()` — client-only for now
- Virtual scrolling or windowing

## Decisions

### 1. Ivi's LIS-based algorithm over udomdiff

**Choice:** Implement Ivi's longest-increasing-subsequence (LIS) algorithm for list diffing.

**Rationale:** Ivi produces provably minimal DOM moves in all cases. udomdiff is simpler (~60 lines vs ~100-120) but can produce extra moves in pathological reorderings. The ~40 extra lines are worth it for correctness. Ivi is what Solid and Inferno use.

**Alternatives considered:**
- udomdiff — simpler but suboptimal moves in adversarial cases
- Full VDOM diff — overkill, hypeup already has fine-grained reactivity
- No reconciler (manual DOM management) — shifts complexity to users

### 2. `each()` as a dedicated primitive over `key()` on elements

**Choice:** `each(items, keyFn, mapFn)` as the list rendering primitive, rather than a `key()` node attached to individual elements.

**Rationale:** `each()` establishes a per-item reactive boundary. When an item's data changes, only that item's `mapFn` effect re-runs — the reconciler is never involved. Without `each()`, any data change in any item re-runs the entire list's thunk, producing N new vdom elements that must be reconciled even if only one changed. For "update every 10th row" on 10,000 rows, this is the difference between 1,000 targeted text node updates vs. 10,000 vdom elements diffed.

**Alternatives considered:**
- `key()` as a vdom node — no per-item reactive scoping, forces full reconciliation on any change
- Compiler-based per-item scoping — hypeup's model resists static analysis of heterogeneous argument lists

### 3. `each()` returns a vdom node type, not raw DOM

**Choice:** `each()` returns an `Each` (new vdom type) that `mount.ts` handles specially, rather than immediately creating DOM.

**Rationale:** This maintains hypeup's architecture where vdom construction and DOM mounting are separate phases. `each()` can be called during vdom tree construction (in component functions), and the actual DOM work happens in `mountElement()` / `processArg()`. This also means `each()` composes naturally with the rest of the DSL — it can appear anywhere a child element can.

**Alternatives considered:**
- `each()` immediately creates DOM — breaks separation between vdom and mount phases
- `each()` returns a plain array — loses the keying/scope metadata

### 4. Per-item effects via reactive proxy, not per-item signals

**Choice:** Each item passed to `mapFn` is the reactive proxy object (from `reactive()`) directly. Item-level reactivity comes from the existing proxy system tracking property reads inside the per-item effect.

**Rationale:** hypeup already has deep reactive proxies. Users write `state.todos` as a reactive array of reactive objects. `each()` iterates the array, and each `mapFn(item)` call runs inside its own effect. When `item.label` changes, only that item's effect re-runs because the proxy tracks per-property access. No new reactivity mechanism needed.

### 5. Structural changes detected by watching the array's `length` property + reconciler

**Choice:** `each()` creates an outer effect that tracks the reactive array reference (or `length` mutation). When the array structure changes, the outer effect re-runs, extracts keys, and dispatches to the reconciler. Per-item effects are nested inside and survive reconciliation if their key persists.

**Rationale:** This separates two concerns: structural changes (add/remove/reorder) handled by the reconciler, and value changes (label update, class toggle) handled by per-item effects. The outer effect only fires on structural mutations; inner effects only fire on property mutations within their item.

## Risks / Trade-offs

**[Risk] Duplicate keys** → Runtime warning in development mode. In production, last-wins behavior (consistent with React/Solid). Duplicate keys will produce incorrect reconciliation but won't crash.

**[Risk] Large list initial mount performance** → Creating N effects (one per item) for a 10,000-row list has overhead vs. a single loop creating DOM. Mitigated by keeping per-item effects minimal (the `mapFn` closure is small) and using `batch()` to defer effect execution during initial mount.

**[Risk] Memory overhead of per-item state** → Each item maintains: a DOM node reference, a dispose function, and an effect closure. For 10,000 items this is ~10,000 closures + ~10,000 effect objects. Estimated ~2-4MB. Acceptable for the performance gain.

**[Trade-off] `each()` required for keyed reconciliation** → Plain arrays still use undo/redo. Users must opt into `each()` to get reconciliation. This is intentional — it makes the performance boundary explicit rather than magical.

**[Trade-off] No non-keyed mode** → `each()` always requires a key function. Non-keyed reconciliation (reusing DOM nodes for different data) is not supported. This simplifies the implementation and avoids the subtle bugs non-keyed mode can introduce.
