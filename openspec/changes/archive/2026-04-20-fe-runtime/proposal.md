## Why

Hypeup currently only supports server-side rendering (`@hypeup/render` produces static HTML/CSS strings). The DSL's distinguishing feature — runtime classification of a flat heterogeneous argument list — needs a client-side counterpart that creates real DOM, subscribes to reactive signals embedded anywhere in the tree, and applies minimal DOM updates when signal values change.

The vdom teardown (Phase 1) deliberately stored raw `contents` with deferred classification to support this: signals stay opaque in `contents` until mount-time so the runtime can subscribe and re-classify when values change. Transformer output is identical for both tiers — only the outer entry point differs (`render()` on server, `mount()` on client).

See: `docs/plan-fe-runtime.md`

## What Changes

- **Create `@hypeup/client`**: Client-side rendering runtime. Three primitives:
  1. `signal(value)` — reactive box, `.get()` / `.set()`, automatic dependency tracking. Built on `@preact/signals-core` initially (can swap later — surface area is tiny: `isSignal`, read, subscribe).
  2. `computed(fn)` — derived signal, caches until deps change.
  3. `mount(node)` — entry point: walks DSL node tree, creates real DOM, sets up per-slot reactive tracking, returns root element.

- **Classification -> slot model**: For every argument to an element node, the runtime:
  1. Classifies by `instanceof` dispatch: `Element` -> child, `Property` -> style, `Attr` -> setAttribute, `CssClass` -> classList, `Raw` -> unescaped content, string -> text child, plain object -> attributes map, array -> flatten/recurse, signal -> reactive-of-the-above.
  2. Applies the classified value to the DOM.
  3. Records an `undo` closure that reverses exactly what was applied.

- **Reactive updates via undo/redo**: On signal change: call `undo()`, classify new value, apply, record new `undo`. No diffing, no morphing — every change tears down the slot and rebuilds it. Kind-switching (signal returns a class one render, a child element the next) costs the same as value-switching.

- **List reconciliation exception**: When old and new are both child-element lists, dispatch to a list reconciler (`udomdiff` or Ivi's algorithm) instead of undo/redo. Everything else stays undo/redo.

- **Reactivity API**: User passes the signal object itself as the value, never a function wrapper or `.get()`:
  ```
  const name = signal("bob")
  div(name)  // signal-of-string -> reactive text child
  ```
  `isSignal(arg)` during classification. If true, subscribe. If false, static — zero tracking overhead.

- **`batch(fn)`**: Group writes, single re-fire. Optimization, not required for correctness. Can come in a follow-up.

## Capabilities

### New Capabilities
- `client-mount`: `mount(node)` — walks DSL tree, creates real DOM, returns root element
- `client-signals`: `signal(value)`, `computed(fn)` — reactive primitives built on `@preact/signals-core`
- `client-classify`: Client-side classification with signal awareness — `instanceof` dispatch, undo/redo per slot
- `client-reconcile`: List reconciler for child-element arrays (deferred to phase 2 if needed — start with full-list replace)

### Modified Capabilities
- None (`@hypeup/runtime` classifiers are server-only; client has its own classify path with signal awareness)

## Impact

- **New package**: `@hypeup/client` (browser-only). Depends on `@hypeup/vdom` (node types), `@hypeup/runtime` (shared helpers), `@preact/signals-core`.
- **Estimated size**: ~50-100 lines of core + list reconciler when needed.
- **`@hypeup/vdom`**: No changes — raw `contents` design from Phase 1 already supports opaque signal values.
- **`@hypeup/runtime`**: No changes — client has its own classification path.
- **Bundle size**: Critical. Must be tree-shakeable and minimal.
- **Prerequisites**: Requires `build-transform` to be complete (DSL source needs the transformer to be executable).

## Non-Goals

- SSR (server runtime already exists via `@hypeup/render`)
- VDOM diffing / morphing
- Compile-time optimization
- Hydration of server-rendered HTML (future follow-up)

## Phasing (within this change)

1. Core: `signal`, `computed`, `mount`, `processArg` with classify/apply/undo. Static + simple reactive cases. No list reconciler.
2. List reconciler: plug in on children-list-changes path.
3. `batch`: group writes.
4. Lazy effects: skip subscription for slots that never read a signal (optimization for large mostly-static pages).

## Open Questions

- Function arguments: should `() => something` be a valid reactive boundary (run in tracking context, subscribe to reads)? Or require explicit signals/computeds only?
- Cleanup semantics: every subscription from `mount` must be disposable when the owning element leaves the DOM. Track per-mount-subtree disposers.
- `@preact/signals-core` uses `.value` instead of `.get()` — wrap or adopt the `.value` convention?
