## Context

Hypeup components are PascalCase functions that the babel plugin wraps in `lazy(Fn, args)`, producing `Lazy` vdom nodes. At mount time, the client calls `lazy.fn(...args)` and expects an `Element` back. On diff, if `fn` and `args` are unchanged (`===`), the subtree is skipped entirely.

This works well for pure components but provides no mechanism for per-instance state. State must be lifted to module scope or external stores, which breaks encapsulation when multiple instances of the same component need independent state.

Mithril's closure components solve this: a function returns an object with a `view()` method that closes over local state. We adapt this pattern to hypeup's functional style: a factory function returns a view *function* instead of an object.

## Goals / Non-Goals

**Goals:**
- Allow components to hold per-instance state via closure variables.
- Factory runs once per mount; the returned view function runs on every redraw.
- No new vdom node types, no hooks, no memo API.
- Works in both client (mount/diff) and SSR (render) paths.
- Fully backward compatible — existing pure components unchanged.

**Non-Goals:**
- Lifecycle hooks (`onmount`, `onremove`) — follow-up work.
- Async factory functions — out of scope.
- Compiler/babel changes — the existing PascalCase-to-`lazy()` transform is sufficient.
- Reactivity system or fine-grained subscriptions.

## Decisions

### 1. Factory detection via `typeof result === "function"`

After calling `lazy.fn(...args)`, check if the result is a function. If so, treat it as a factory; if it's an Element (or other vdom node), use existing behavior.

**Rationale:** This is the simplest possible detection with zero new API surface. A component is a factory if and only if it returns a function. No registration, no decorators, no special wrappers.

**Alternative considered:** A new `Factory` vdom node type or a `factory()` wrapper function. Rejected because it adds API surface and requires babel changes for no real benefit.

**Alternative considered:** Checking `result.prototype` or using a symbol marker. Rejected — unnecessarily complex when `typeof` is unambiguous (Element instances are objects, not functions).

### 2. Store the view function on the MountHandle / SlotRecord

When a factory is detected, the `MountHandle` for that lazy slot stores:
- `viewFn`: the returned view function
- `factoryFn`: the original factory function reference (for identity comparison on diff)
- `factoryArgs`: the original args (for shallow comparison on diff)

On redraw:
- If `factoryFn` and `factoryArgs` are unchanged (`===`), call `viewFn()` and diff the result against the previous Element.
- If `factoryFn` is the same but args changed, re-run the factory with new args, store the new `viewFn`, call it, and diff.
- If `factoryFn` changed, dispose the old handle and mount fresh.

**Rationale:** This mirrors the existing Lazy skip logic but adds the factory/view split. The skip optimization still works — unchanged args skip the factory, but unlike pure Lazy, they still call the view function (since state may have changed).

**Alternative considered:** Skip the view call too when args are unchanged and no `redraw()` was requested. Rejected for now — adds complexity and risks stale renders. Can be optimized later.

### 3. SSR renders factories by calling factory then view

In `renderNode`'s `Lazy` case:
1. Call `lazy.fn(...args)` to get the result.
2. If `typeof result === "function"`, call `result()` to get the Element.
3. Render the Element.

Factory state is meaningless in SSR (no redraws), so the factory is just called once and the view is called once. No caching needed.

**Rationale:** Minimal change — two lines in the existing `Lazy` case.

### 4. No changes to `Lazy` vdom node or babel plugin

The `Lazy` node already stores `fn` and `args`. The babel plugin already wraps PascalCase calls in `lazy()`. Factory vs pure is a runtime distinction made when the function is first called.

**Rationale:** Keeps the change surface minimal and avoids any compile-time coupling.

## Risks / Trade-offs

- **[Risk] A component accidentally returns a function (e.g., returning a callback instead of vdom)** -> This would be misinterpreted as a factory. Mitigation: this is unlikely in practice since component return values are always either vdom or a view function. Document the convention clearly.

- **[Risk] Factory args change on every render (new object literals), causing the factory to re-run and lose state** -> Same risk as current Lazy skip — users must ensure stable references. Mitigation: document that factory args should be stable references, same as current Lazy behavior.

- **[Trade-off] View function is always called on redraw even when args haven't changed** -> This means factory components don't get the "skip entirely" optimization that pure Lazy components get. This is correct behavior (closure state may have changed via `redraw()`), but is slightly less optimal. Can be revisited if profiling shows it matters.
