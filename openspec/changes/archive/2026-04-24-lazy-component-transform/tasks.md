## 1. Lazy Vdom Node

- [x] 1.1 Create `vdom/src/Lazy.ts` with `Lazy` class (`fn: Function`, `args: unknown[]`)
- [x] 1.2 Export `Lazy` from `vdom/src/index.ts`

## 2. Classify + Apply

- [x] 2.1 Add `Lazy` to `classify.ts` — recognize `Lazy` instances as `{ kind: "lazy", lazy: Lazy }`
- [x] 2.2 Add `{ kind: "lazy"; fn: Function; args: unknown[]; handle: MountHandle }` to `SlotRecord` in `apply.ts`
- [x] 2.3 Add `undoSlot` handling for `lazy` kind — dispose the stored MountHandle, remove element

## 3. Mount + Diff

- [x] 3.1 Handle `lazy` classified kind in `mount.ts` `applyClassified` — call `fn(...args)`, mount result, store MountHandle + fn + args in SlotRecord
- [x] 3.2 Handle `lazy` in `diffSlot` — same fn + shallow-equal args: skip; same fn + different args: re-call fn, diff result; different fn: dispose + remount
- [x] 3.3 Implement `argsEqual(prev, next)` shallow comparison helper

## 4. Runtime Factory

- [x] 4.1 Create `client/src/lazy.ts` with `lazy(fn, args)` function returning `new Lazy(fn, args)`
- [x] 4.2 Export `lazy` from `client/src/index.ts`

## 5. Babel Plugin

- [x] 5.1 Add `lazy` to client helpers in `babel/src/buildTable.ts`
- [x] 5.2 Add PascalCase `CallExpression` visitor in `hypeupBabelPlugin.ts` — detect PascalCase identifier calls with at least one argument, not in the primitive table, not a known JS built-in
- [x] 5.3 Transform detected calls: `TodoRow(a, b)` → `lazy(TodoRow, [a, b])` (regardless of position)
- [x] 5.4 Skip zero-arg PascalCase calls (do not wrap)
- [x] 5.5 Add built-in exclusion list (`String`, `Number`, `Boolean`, `Object`, `Array`, `Date`, `Map`, `Set`, `Promise`, `Error`, `RegExp`)
- [x] 5.6 Skip `new` expressions (only bare calls)

## 6. Tests

- [x] 6.1 Add tests for `Lazy` mount — first mount calls fn and creates DOM
- [x] 6.2 Add tests for lazy skip — same fn + same args produces no DOM ops
- [x] 6.3 Add tests for lazy re-run — same fn + different args diffs correctly
- [x] 6.4 Add tests for lazy fn change — different fn disposes and remounts
- [x] 6.5 Add tests for lazy transitions — lazy ↔ non-lazy slot changes
- [x] 6.6 Add babel plugin tests — PascalCase wrapping, zero-arg skip, non-element-child skip
- [x] 6.7 Verify all existing tests still pass

## 7. Benchmark Update

- [x] 7.1 Refactor benchmark `main.ts` to use a `TodoRow` component function with explicit args
- [x] 7.2 Build and verify benchmark app runs correctly
- [x] 7.3 Run benchmark suite and compare results
