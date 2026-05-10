## Why

Hypeup components are currently pure functions — they run on every redraw, producing fresh vdom each time. There is no way to hold per-instance state (counters, toggle flags, fetched data) across redraws without lifting state into module-level variables or external stores. Mithril solves this with closure components; hypeup needs an equivalent that fits its functional DSL style.

## What Changes

- Components may be **factory functions**: a PascalCase function that returns a *function* (the view) instead of an Element. The outer factory runs once on mount, establishing closure state. The inner view function runs on each redraw.
- The `Lazy` resolution path in the client (`mount.ts`, `apply.ts`) gains factory detection: when calling `lazy.fn(...args)` produces a function rather than an Element, the client stores that function and calls it for the view on mount and subsequent redraws.
- The SSR renderer (`render.ts`) gains the same detection: if resolving a `Lazy` node yields a function, call it to get the Element and render that.
- No new vdom node types. No hooks API. No memo API. Factory components reuse the existing `Lazy` node and babel PascalCase transform — the only change is in how the resolved result is interpreted.
- Lifecycle hooks (`onmount`, `onremove`) can be registered from within the factory closure via existing or new small helpers, but this is a follow-up concern — the core change is factory detection and cached-view storage.

## Capabilities

### New Capabilities
- `factory-component`: Detection and handling of factory components (functions that return a view function) in the client mount/diff path and SSR render path.

### Modified Capabilities
- `lazy-component`: The Lazy resolution logic must distinguish between a result that is an Element (current behavior) and a result that is a function (factory component — new behavior).
- `server-render`: The Lazy case in `renderNode` must handle factory results (call the returned function to get the Element).
- `slot-diffing`: Lazy slot diffing must account for factory components — on re-render with changed args, the factory must be re-invoked and the new view function stored, not just the Element diffed.

## Impact

- **`@hypeup/vdom`**: No changes — `Lazy` node stays as-is.
- **`@hypeup/client`**: `mount.ts` and `apply.ts` — factory detection in `mountElement`/`diffElement` lazy handling. The `MountHandle` or `SlotRecord` for lazy slots needs to store the cached view function.
- **`@hypeup/render`**: `render.ts` — the `Lazy` case calls the result if it's a function.
- **`@hypeup/babel`**: No changes — PascalCase transform already produces `lazy()` calls. Factory vs pure is a runtime distinction, not a compile-time one.
- **No breaking changes.** Existing pure PascalCase components continue to work unchanged. A component only becomes a factory if it returns a function.
