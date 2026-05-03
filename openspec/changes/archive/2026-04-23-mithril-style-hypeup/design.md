## Context

hypeup currently uses Proxy-based reactivity (`reactive.ts`, ~217 lines) with automatic dependency tracking (`effect.ts`, ~137 lines) and a babel plugin that wraps reactive reads in thunks. Benchmarking against React revealed that this "surgical" approach is actually slower for most operations because V8 proxy traps are expensive at scale (~10x overhead per property access vs plain objects). The reactive plumbing also accounts for most of hypeup's runtime memory (10.3MB vs React's 4.5MB for 1000 rows).

Mithril.js demonstrates that an assertive redraw model -- re-run the view function, diff the output, patch the DOM -- can be both simpler and fast enough. hypeup's classification system is well-suited to this: instead of diffing virtual DOM trees, it diffs flat classified slot lists, which is cheaper.

## Goals / Non-Goals

**Goals:**
- Eliminate all proxy-based reactivity and automatic dependency tracking
- Replace with explicit `redraw()` that re-runs the component, diffs classified slots, patches DOM
- Reduce client bundle size by removing ~400 lines of reactive infrastructure
- Improve benchmark performance by eliminating proxy overhead
- Simplify the babel plugin (no thunk wrapping, just identifier rewriting)
- Keep the existing DSL surface (`div(className("foo"), "text", on("click", handler))`)
- Keep the keyed list reconciler for `each()`

**Non-Goals:**
- Virtual DOM tree diffing (React-style) -- we diff classified slots, not trees
- Server-side rendering changes -- `@hypeup/render` is unaffected
- Incremental/partial redraw scoping (future optimization, not needed now)
- Component lifecycle hooks (keep it simple)

## Decisions

### 1. Redraw model: full component re-run + slot diff

On `redraw()`, re-invoke the root component function to produce a new vdom tree. Walk it in parallel with the previous mount's recorded slot map. For each slot position, classify the new arg and compare against the previous classification:

- Same kind, same value: skip (no DOM op)
- Same kind, different value: targeted mutation (`textNode.data`, `classList`, `style.setProperty`, `setAttribute`)
- Different kind: undo old, apply new
- Child elements: recurse

**Why**: This is the "Strategy 3" from the original design discussion -- diffing your own previous classification output. It's cheaper than vdom tree diffing because it's a flat slot-by-slot comparison. And it's cheaper than the current proxy system because there are no proxy traps, no subscriber sets, no effect tracking.

**Alternative considered**: Keep fine-grained reactivity but use signals instead of proxies. Rejected because it still requires thunk wrapping, effect bookkeeping, and the babel plugin complexity. The Mithril model is fundamentally simpler.

### 2. `mount()` returns a redraw handle

```ts
const app = mount(document.getElementById("main"), () => App())
app.redraw()  // manual redraw
```

`mount()` takes a root element and a component function (not a vdom tree). It calls the function, mounts the result, and returns a handle with `redraw()` and `dispose()`. The component function is re-invoked on each redraw.

**Why**: The component function must be re-invocable to produce fresh vdom on redraw. Passing a function (not a pre-evaluated tree) makes this explicit.

### 3. `redraw` is a global helper

`redraw` is exported from `@hypeup/client` and also declared as a global by the lexicon (like `div`, `className`, `on`, etc.). This means user code can call `redraw()` anywhere without importing it -- in fetch callbacks, timers, or any async context.

**Why**: Consistency with the rest of the DSL. If `div` and `on` are globals, `redraw` should be too. It's the one runtime primitive users interact with directly.

### 4. Auto-redraw on event handlers

`on("click", handler)` wraps the handler: call the user's handler, then call `redraw()`. This mirrors Mithril's behavior and means most interactive updates require zero boilerplate.

```ts
// user writes:
button(on("click", () => state.count++), state.count)
// runtime does: handler(); redraw()
```

An `on.silent("click", handler)` escape hatch skips auto-redraw for handlers that don't affect UI (analytics, logging).

**Why**: Auto-redraw after events covers 90% of update triggers. The remaining 10% (fetch callbacks, timers) use manual `redraw()`.

### 5. `each()` becomes a pure vdom marker

`each(items, keyFn, mapFn)` still returns an `Each` vdom node. But instead of creating effects and a live reconciler, it's diffed during redraw: the slot differ sees an `Each` node, runs the keyed reconciler against the previous `Each`'s children, and patches/creates/removes DOM nodes accordingly.

The reconciler (`reconcile.ts`) is unchanged -- it still does LIS-based keyed diffing. It just runs during the redraw diff pass instead of inside a reactive effect.

**Why**: The reconciler is correct and fast. Only the trigger mechanism changes (redraw vs effect).

### 6. State is plain JS

```ts
const state = { data: [], selected: 0 }
```

No `reactive()`, no proxies. Mutations are direct property assignments. The component function reads state directly during re-invocation.

**Why**: Zero overhead. No proxy traps, no subscriber maps, no WeakMaps. V8 optimizes plain object property access aggressively.

### 7. Babel plugin simplified to identifier rewriting only

The plugin currently does two things: (a) rewrite global DSL identifiers to namespaced calls, (b) wrap reactive expressions in thunks. With the Mithril model, only (a) is needed. Thunk wrapping is removed entirely.

**Why**: No tracking context means no need to defer evaluation.

## Risks / Trade-offs

**[Full re-render on every event]** → For large component trees, re-running the entire component function and diffing all slots could be slower than surgical updates. → Mitigation: hypeup's classification diff is a flat comparison, not a tree diff. For 1000 rows with ~10 args each, that's 10000 slot comparisons -- mostly `===` checks that short-circuit. Mithril proves this is fast enough in practice.

**[No automatic granularity]** → If a timer updates one value, redraw diffs everything. → Mitigation: `mount()` could support subtree scoping in the future (mount multiple independent roots). For now, full redraw is the simple correct path.

**[Breaking change]** → All user code using `reactive()`, `effect()`, etc. must be rewritten. → Mitigation: hypeup is pre-1.0 with one user. The migration is straightforward: remove `reactive()` wrappers, add `redraw()` calls after async operations.

**[Loss of lazy evaluation]** → Currently, thunks inside a row template are only re-evaluated when their tracked dependencies change. With redraw, the entire mapFn re-runs for every row on every redraw. → Mitigation: The mapFn produces lightweight vdom nodes (not DOM), so re-running it is cheap. The expensive part (DOM mutations) is gated by the slot diff.

## Open Questions

- Should `redraw()` be synchronous (like Mithril) or batched to next microtask/rAF? Synchronous is simpler and predictable. Batched avoids redundant redraws from multiple rapid state changes.
- Should the slot differ handle `Each` nodes inline or delegate to the existing `reconcile()` function? Delegation is simpler and reuses proven code.
