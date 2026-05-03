## 1. Delete Reactive Infrastructure

- [x] 1.1 Delete `client/src/reactive.ts`
- [x] 1.2 Delete `client/src/effect.ts`
- [x] 1.3 Delete `client/src/signal.ts` (if not already deleted)
- [x] 1.4 Remove `reactive`, `effect`, `computed`, `batch` exports from `client/src/index.ts`
- [x] 1.5 Remove `@preact/signals-core` from `client/package.json` (if not already removed)
- [x] 1.6 Delete reactive/effect test files

## 2. Implement Slot Diffing

- [x] 2.1 Define `SlotRecord` type: `{ kind, value, undo, target }` for recording what was applied
- [x] 2.2 Refactor `apply()` to return `SlotRecord` (undo + classification + DOM target reference)
- [x] 2.3 Implement `diffSlot(element, oldSlot, newClassified)` — same-kind/same-value skip, same-kind/different-value targeted mutation, kind-mismatch undo+reapply
- [x] 2.4 Implement `diffElement(oldHandle, newVdom)` — walks args in parallel, calls `diffSlot` per slot, recurses into child elements
- [x] 2.5 Handle `Each` nodes in the differ — delegate to keyed reconciler
- [x] 2.6 Handle null/false transitions (slot appears/disappears)

## 3. Implement Redraw System

- [x] 3.1 Create `client/src/redraw.ts` with module-level redraw state (current component fn, current mount handle, current root)
- [x] 3.2 Implement `redraw()` — re-invoke component fn, call `diffElement` against previous handle, update stored handle
- [x] 3.3 Export `redraw` from `client/src/index.ts`

## 4. Rewrite mount.ts

- [x] 4.1 Change `mount(root, componentFn)` signature — accepts root element + component function
- [x] 4.2 `mount()` calls componentFn, mounts result via `mountElement`, records slot state, registers with redraw system
- [x] 4.3 `mount()` returns `{ redraw(), dispose() }` handle
- [x] 4.4 `mountElement` simplified — no effect wrapping, no thunk handling; classifies and applies args statically, returns mount handle with slot records
- [x] 4.5 Remove all `effect()` and `setCurrentEffect` usage from mount.ts

## 5. Rewrite each.ts

- [x] 5.1 `each()` returns `Each` vdom node (unchanged signature)
- [x] 5.2 Remove `mountEach()` with its outer/inner effects
- [x] 5.3 Add `diffEach(parent, oldEachState, newEach)` — runs keyed reconciler, diffs reused items' child slots
- [x] 5.4 `diffEach` stores per-item mount handles for child slot diffing on subsequent redraws

## 6. Auto-Redraw on Events

- [x] 6.1 Modify `on(event, handler)` to wrap handler with auto-redraw: `handler(); redraw()`
- [x] 6.2 Add `on.silent(event, handler)` that skips auto-redraw
- [x] 6.3 Use try/finally to ensure redraw runs even if handler throws

## 7. Simplify Babel Plugin

- [x] 7.1 Remove thunk-wrapping visitor from the babel plugin
- [x] 7.2 Keep identifier-rewriting visitor unchanged
- [x] 7.3 Add `redraw` to the set of known global identifiers the plugin rewrites
- [x] 7.4 Verify plugin output no longer wraps expressions in `() =>`

## 7.5. Lexicon Global Declaration

- [x] 7.5 Add `redraw` to the lexicon's global type declarations so it's available without import

## 8. Update Benchmark App

- [x] 8.1 Rewrite `frameworks/keyed/hypeup/src/store.ts` — plain state object, no `reactive()` *(skipped — benchmark app not in this repo)*
- [x] 8.2 Rewrite `frameworks/keyed/hypeup/src/main.ts` — use new `mount(root, componentFn)` API *(skipped — benchmark app not in this repo)*
- [x] 8.3 Build and verify benchmark app runs *(skipped — benchmark app not in this repo)*

## 9. Update Tests

- [x] 9.1 Rewrite `each.test.ts` for new non-reactive each behavior
- [x] 9.2 Add tests for slot diffing (text patch, class swap, kind change, child recurse)
- [x] 9.3 Add tests for redraw system (mount, redraw, dispose)
- [x] 9.4 Add tests for auto-redraw on events
- [x] 9.5 Verify all tests pass

## 10. Benchmark Validation

- [x] 10.1 Run full benchmark suite *(skipped -- benchmark suite not in this repo)*
- [x] 10.2 Compare results against previous hypeup numbers and React *(skipped -- benchmark suite not in this repo)*
- [x] 10.3 Verify benchmark 03 (update 10th) works correctly *(skipped -- benchmark suite not in this repo)*
