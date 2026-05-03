## Why

The item-skip optimization in `each()` dramatically improved list benchmarks (update 10th: 13x faster, swap: 16x faster), but it only works when the mapFn's output depends solely on the item data reference. When external state like `selected` changes, all items must re-diff because the framework can't distinguish which rows are affected. The `context` parameter mitigates this but forces a full re-diff of all items when context changes. A component-level skip mechanism — where the babel plugin wraps PascalCase function calls in lazy nodes that compare arguments — would enable per-row skipping even when external state changes, by making each row's dependencies explicit as function arguments.

## What Changes

- Add `Lazy` vdom node type that stores a component function + its arguments without calling it
- Babel plugin detects PascalCase function calls used as element children and wraps them in `lazy(fn, [...args])` — no DX change for the user
- Mount system handles `Lazy` nodes: on first mount, call the function and mount the result; on diff, shallow-compare args and skip the subtree if unchanged
- Classify system recognizes `Lazy` nodes
- Slot diffing handles `Lazy` ↔ `Lazy` transitions (same fn + same args = skip, different args = re-run + diff)

## Capabilities

### New Capabilities
- `lazy-component`: The `Lazy` vdom node, `lazy()` runtime function, mount/diff handling, and the skip-by-args-comparison logic

### Modified Capabilities
- `babel-plugin`: Babel plugin detects PascalCase function calls in element children and wraps them in `lazy(fn, [...args])` instead of passing the call result directly
- `client-mount`: Mount system handles `Lazy` vdom nodes — deferred evaluation, MountHandle storage, arg-comparison-based skip on diff
- `slot-diffing`: Slot differ handles `Lazy` slot records — compares function reference and args, skips subtree when unchanged

## Impact

- **Code**: New `vdom/src/Lazy.ts`. New `lazy` classify kind + SlotRecord variant. New diff handling in `mount.ts`. Babel plugin gains PascalCase detection visitor.
- **APIs**: No user-facing API changes. The `lazy()` function exists at runtime but users never call it directly — babel inserts it.
- **User code**: No changes required. Existing PascalCase component functions automatically benefit. Users can opt into better skip behavior by passing closed-over state as function arguments instead of reading from closure.
- **Bundle size**: Small increase (~50-80 lines of new code).
- **Performance**: Expected significant improvement on benchmark 04 (select) — per-row arg comparison instead of full context-triggered re-diff. General improvement for any component subtree whose args haven't changed.
