## Why

hypeup's Proxy-based reactive system (`reactive.ts`, `effect.ts`, babel thunk wrapping) adds ~400 lines of runtime complexity, 2.5x memory overhead vs React, and proxy trap costs on every property access. Benchmarking showed that the "surgical" reactivity is actually slower than React's full re-render+diff approach because proxy operations in V8 are expensive at scale. Switching to a Mithril-style assertive redraw model eliminates the reactive plumbing entirely, replacing it with explicit `redraw()` calls and vdom slot diffing -- simpler DX, smaller bundle, and likely faster benchmarks.

## What Changes

- **BREAKING** Remove `reactive()` API -- state is plain JS objects, no proxies
- **BREAKING** Remove `effect()`, `computed()`, `batch()` APIs -- no automatic dependency tracking
- **BREAKING** Remove babel plugin thunk wrapping -- no `() => expr` transformation needed since there's no tracking context
- Add `redraw()` function that re-runs the root component, diffs the new vdom against the previous, and patches the DOM
- Add slot-level vdom diffing in `mount.ts` -- compare previous classified args against new ones and apply targeted DOM mutations (text: `.data`, class: `classList`, style: `setProperty`, etc.)
- `mount()` becomes stateful -- retains the previous vdom tree and classified slot map for diffing on redraw
- `each()` simplified -- operates on plain arrays, reconciler runs during redraw diff, no outer/inner effects
- Event handlers (`on()`) automatically trigger `redraw()` after execution (like Mithril's auto-redraw)
- Manual `redraw()` available for async updates (fetch callbacks, timers, etc.)

## Capabilities

### New Capabilities
- `redraw-system`: The `redraw()` function, auto-redraw on event handlers, manual redraw API, and the render loop that diffs and patches
- `slot-diffing`: Slot-level vdom diffing that compares previous vs new classified args and applies targeted DOM mutations instead of full subtree recreation

### Modified Capabilities
- `client-mount`: `mount()` becomes stateful, retains previous vdom/slot state, supports redraw-triggered patching instead of one-shot DOM creation
- `each-primitive`: `each()` no longer creates effects; operates on plain arrays, reconciler runs during the redraw diff pass
- `client-events`: Event handlers auto-trigger `redraw()` after execution

### Removed Capabilities
- `reactive-state`: Proxy-based reactive system removed entirely
- `effect-system`: Effect/computed/batch removed entirely
- `compiler-thunks`: Babel plugin thunk wrapping removed -- no longer needed
- `client-signals`: Signal system removed (already dead code, formally dropped)

## Impact

- **Code**: Delete `reactive.ts`, `effect.ts`, `signal.ts`. Major rewrite of `mount.ts`, `each.ts`, `apply.ts`. Simplify or remove babel plugin. New `redraw.ts` module.
- **APIs**: **BREAKING** -- `reactive()`, `effect()`, `computed()`, `batch()` removed from public API. New `redraw()` export. `mount()` return type changes to include redraw handle.
- **User code**: Benchmark app (`store.ts`, `main.ts`) rewritten to use plain state + `redraw()`. TodoMVC app similarly.
- **Bundle size**: Expected significant reduction -- removing ~400 lines of reactive infrastructure, adding ~100 lines of diffing
- **Performance**: Expected improvement on all mutation benchmarks due to zero proxy overhead. Trade-off: updates re-diff the component tree instead of surgically updating tracked slots.
- **Dependencies**: `@preact/signals-core` already removed. No new dependencies.
- **Babel plugin**: Greatly simplified or removed. Only needs to rewrite global DSL identifiers, no thunk wrapping.
