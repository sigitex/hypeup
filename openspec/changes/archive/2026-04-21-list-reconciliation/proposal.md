## Why

hypeup's client runtime currently handles child arrays with full undo/redo — when a reactive thunk returns a new array of children, all old DOM nodes are removed and all new ones are mounted from scratch. This makes list-heavy operations (insert, remove, swap, reorder) O(n) in DOM mutations regardless of what actually changed. A keyed list reconciler with per-item reactive scopes is required for competitive performance, and is the blocker for submitting hypeup to the js-framework-benchmark suite.

## What Changes

- Add an `each(items, keyFn, mapFn)` primitive (with a two-argument overload `each(items, mapFn)` that defaults to index-based keying) that creates per-item reactive scopes and a keyed DOM node map, enabling surgical updates when list structure or item values change
- Implement a keyed list reconciliation algorithm (Ivi's LIS-based approach) that computes minimal DOM mutations (insert, remove, move) given old and new keyed lists
- Integrate the reconciler into the existing mount/apply pipeline so that structural list changes (add/remove/swap/reorder) produce minimal DOM operations while item value changes bypass reconciliation entirely via per-item effects
- Add `each` to the babel transform and lexicon globals so it is available as a DSL primitive without imports
- Retain the existing full undo/redo path as the fallback for non-keyed arrays and kind-switching scenarios

## Capabilities

### New Capabilities
- `list-reconciler`: Keyed list diffing algorithm (Ivi's LIS-based) that takes old/new keyed child maps and produces minimal DOM mutations (insertions, removals, moves)
- `each-primitive`: The `each(items, keyFn, mapFn)` DSL primitive (with two-argument overload) — creates per-item reactive scopes, manages keyed DOM node lifecycle, dispatches structural changes to the reconciler
- `server-render`: `render()` handles `Each` nodes by iterating items and rendering each mapped element to HTML (no keying server-side)

### Modified Capabilities
- `client-reconcile`: Phase 2 keyed reconciliation replaces Phase 1 full-list replacement for arrays of child elements when used via `each()`
- `client-mount`: Mount pipeline gains the `each()` integration point — `each()` returns a special node type that mount handles distinctly from plain arrays
- `babel-plugin`: Transform must recognize `each` as a DSL global and rewrite it to a runtime import (similar to `on`, `reactive`)

## Impact

- **New files**: `client/src/reconcile.ts` (Ivi algorithm), `client/src/each.ts` (each primitive), `vdom/src/Each.ts` (vdom node type)
- **Modified files**: `client/src/mount.ts` (each integration), `client/src/classify.ts` (Each node classification), `babel/src/plugin.ts` (each transform), `lexicon/src/primitives.ts` (global declaration), `render/src/render.ts` (Each node rendering)
- **Dependencies**: None new — Ivi algorithm is implemented from scratch (~100-120 lines)
- **APIs**: New public API `each(items, keyFn, mapFn)` and `each(items, mapFn)` exported from `@hypeup/client`; `Each` vdom node type exported from `@hypeup/vdom`
- **Backward compatibility**: Fully backward compatible — existing array handling unchanged, `each()` is additive
