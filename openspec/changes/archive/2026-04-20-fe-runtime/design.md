## Context

Hypeup currently supports server-side rendering only (`@hypeup/render` produces static HTML/CSS strings). The Phase 1 vdom teardown stored raw `contents` with deferred classification specifically to enable a client-side runtime: signals stay opaque in `contents` until mount-time so the runtime can subscribe and re-classify when values change.

No client package exists yet. The DSL's heterogeneous-argument classification model doesn't fit existing frameworks (Solid, React, Preact) — they assume static structural sorting at the call site. A purpose-built ~50-100 line runtime is needed.

## Goals / Non-Goals

**Goals:**
- Create `@hypeup/client` with three primitives: `signal(value)`, `computed(fn)`, `mount(node)`
- Implement client-side classification with signal awareness and undo/redo per slot
- Keep bundle size minimal and tree-shakeable

**Non-Goals:**
- SSR (server runtime already exists via `@hypeup/render`)
- VDOM diffing or morphing
- Compile-time optimization
- Hydration of server-rendered HTML (future follow-up)
- List reconciliation in Phase 1 (full-list replace is sufficient to start)

## Decisions

### 1. Build signals on `@preact/signals-core`

Framework-agnostic, ~200 LOC, well-tested. API uses `.value` instead of `.get()` — adopt the `.value` convention directly rather than wrapping. `isSignal()` check available for classification.

**Alternative considered:** Roll our own. Rejected for now — switching later is cheap because the surface area is tiny (`isSignal`, read, subscribe). Roll own only if preact/signals blocks us.

### 2. Undo/redo per slot, not diffing

For every argument processed during mount, the runtime records an `undo` closure. On signal change: call `undo()`, classify new value, apply, record new `undo`. No diffing, no morphing. Kind-switching (signal returns a class one render, a child element the next) costs the same as value-switching.

**Why not diff?** The DSL's heterogeneous argument model means any argument can be any kind. Diffing across kinds is complex and fragile. Tear-down-and-rebuild per slot is simple, uniform, and correct.

### 3. List reconciliation deferred to Phase 2

Phase 1 replaces the whole list on change. When list workloads become real, plug in `udomdiff` or Ivi's algorithm on the children-list-changes path only.

### 4. Classification via `instanceof` dispatch

Same model as server-side classification but with signal awareness:
- `Element` -> child element (recursive mount)
- `Property` -> `style` property
- `Attr` -> `setAttribute`
- `CssClass` -> `classList.add`
- `Raw` -> innerHTML / unescaped content
- string -> text child
- plain object -> attributes map
- array -> flatten and recurse
- signal -> subscribe, classify inner value, track undo

### 5. Signals as values, not wrappers

Users pass the signal object itself as a value, never `() => sig.get()`:
```
const name = signal("bob")
div(name)  // signal-of-string -> reactive text child
```
`isSignal(arg)` check during classification. Static args get zero tracking overhead.

### 6. Cleanup via per-mount disposers

Every subscription created during `mount()` must be disposable when the owning element leaves the DOM. Track disposers per mount subtree.

## Risks / Trade-offs

- **[`@preact/signals-core` dependency]** Adds ~200 LOC to bundle. -> Mitigation: Tree-shakeable, can swap for own implementation later with minimal API surface change.
- **[No list reconciliation in Phase 1]** Large list mutations replace entire list. -> Mitigation: Phase 2 adds reconciler. Most initial use cases are small/medium lists.
- **[No hydration]** Server-rendered HTML cannot be reused by client mount. -> Mitigation: Explicitly out of scope; mount creates fresh DOM. Hydration is a future follow-up.
- **[Cleanup semantics]** Forgetting to dispose subscriptions causes memory leaks. -> Mitigation: Disposers tracked automatically per mount subtree; explicit `unmount()` or DOM removal triggers cleanup.

## Open Questions

- Should `() => something` be a valid reactive boundary (run in tracking context, subscribe to reads)? Or require explicit signals/computeds only? Leaning toward signals-only for now.
- `batch(fn)` for grouped writes — optimization, not correctness. Defer to Phase 3.
