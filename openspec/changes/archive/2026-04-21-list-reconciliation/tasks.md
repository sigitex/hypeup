## 1. Reconciler Algorithm

- [x] 1.1 Create `client/src/reconcile.ts` with Ivi's LIS-based keyed list diff algorithm
- [x] 1.2 Define `KeyedItem` type (key, DOM node, dispose function) used by the reconciler
- [x] 1.3 Implement LIS (longest increasing subsequence) helper function
- [x] 1.4 Implement `reconcile(parent, oldItems, newKeys, mount)` that computes and applies minimal DOM mutations (insert, remove, move)

## 2. Each vdom Type

- [x] 2.1 Create `Each` class in `vdom/src/Each.ts` with fields: items, keyFn, mapFn
- [x] 2.2 Export `Each` from `@hypeup/vdom` package index

## 3. each() Primitive

- [x] 3.1 Create `client/src/each.ts` exporting `each(items, keyFn, mapFn)` and `each(items, mapFn)` overloads that return an `Each`
- [x] 3.2 Export `each` from `@hypeup/client` package index

## 4. Mount Integration

- [x] 4.1 Add `Each` detection to `classify.ts` (new classified kind or instanceof check in `processArg`)
- [x] 4.2 Implement `mountEach(parent, eachNode, disposers)` in `client/src/each.ts` — creates outer structural effect tracking array identity/length
- [x] 4.3 Implement per-item effect creation within `mountEach` — each item gets its own effect running `mapFn(item, index)` through `mountElement`
- [x] 4.4 Wire `mountEach` into `processArg()` in `mount.ts` to handle `Each` instances
- [x] 4.5 Implement structural change handler: on outer effect re-run, extract new keys, invoke reconciler, mount new items, dispose removed items
- [x] 4.6 Implement disposal: when parent is disposed, clean up all per-item effects and the outer structural effect

## 5. Babel Plugin

- [x] 5.1 Add `each` to the set of recognized DSL globals in the babel plugin
- [x] 5.2 Configure `each` rewriting to import from `@hypeup/client` (not `@hypeup/runtime`)
- [x] 5.3 Ensure `each()` arguments are NOT thunk-wrapped (they are functions already)

## 6. Lexicon / Types

- [x] 6.1 Add `each` global type declaration to `lexicon/src/primitives.ts`
- [x] 6.2 Define `each` overload signatures: three-argument `each<T>(items: T[], keyFn: (item: T) => unknown, mapFn: (item: T, index: number) => Element): Each` and two-argument `each<T>(items: T[], mapFn: (item: T, index: number) => Element): Each`

## 7. Server-Side Rendering

- [x] 7.1 Add `Each` node handling to `render/src/render.ts` — iterate items, call mapFn, render resulting Elements
- [x] 7.2 Handle empty `Each` nodes (zero items)

## 8. TodoMVC Migration

- [x] 8.1 Update TodoMVC app to use `each()` for the todo list rendering (replace plain array mapping)
- [x] 8.2 Add key function using `todo.id` for keyed reconciliation
- [x] 8.3 Verify per-item reactivity works for todo label editing, completion toggle, and selection
- [x] 8.4 Verify structural operations work: add todo, remove todo, clear completed

## 9. Tests

- [x] 9.1 Unit tests for reconciler: append, remove, swap, reverse, full replace, empty-to-populated, populated-to-empty, single move
- [x] 9.2 Unit tests for LIS helper: correctness on various permutations
- [x] 9.3 Integration tests for `each()`: per-item reactive updates only trigger affected item's effect
- [x] 9.4 Integration tests for `each()`: structural changes (push, splice, swap, replace) trigger reconciler and produce correct DOM
- [x] 9.5 Integration tests for `each()`: disposal cleans up all effects
- [x] 9.6 Integration tests for `each()`: empty array handling (initial empty, transition to empty)
- [x] 9.7 Integration tests for `each()`: two-argument overload with index-based keying
- [x] 9.8 Babel plugin tests: `each` rewritten to import, arguments not thunk-wrapped, local binding not rewritten
- [x] 9.9 Server-render tests: `Each` node renders correct HTML, empty list, two-argument overload
