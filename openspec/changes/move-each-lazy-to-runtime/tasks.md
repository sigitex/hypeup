## 1. Runtime — Add each and lazy

- [x] 1.1 Add `each()` function (both overloads) to `@hypeup/runtime/src/helpers.ts`, importing `Each` from `@hypeup/vdom`
- [x] 1.2 Add `lazy()` function to `@hypeup/runtime/src/helpers.ts`, importing `Lazy` from `@hypeup/vdom`
- [x] 1.3 Export `each` and `lazy` from `@hypeup/runtime/src/index.ts`
- [x] 1.4 Add `Each` and `Lazy` to the vdom re-exports in `@hypeup/runtime/src/index.ts`

## 2. Babel Plugin — Update primitive table

- [x] 2.1 In `buildTable.ts`, move `"each"` and `"lazy"` from `clientHelpers` to `escapeHatches`
- [x] 2.2 Verify `clientHelpers` now only contains `["on", "redraw", "ref"]`

## 3. Client — Re-export and clean up

- [ ] 3.1 In `@hypeup/client/src/each.ts`, remove the `each()` constructor function and import it from `@hypeup/runtime` instead
- [ ] 3.2 Remove `@hypeup/client/src/lazy.ts` (or replace with re-export from runtime)
- [ ] 3.3 Update `@hypeup/client/src/index.ts` to re-export `each` from `@hypeup/runtime` and `lazy` from `@hypeup/runtime`
- [ ] 3.4 Verify `mountEach` and `diffEach` still work in client (they import `Each` from vdom, not the `each` function)

## 4. Tests and Validation

- [ ] 4.1 Run existing babel plugin tests — each/lazy transforms should still pass
- [ ] 4.2 Run existing client tests — mount/diff/each tests should still pass
- [ ] 4.3 Run render tests — SSR rendering of Each and Lazy should still pass
- [ ] 4.4 Verify an SSR-only project can use `each` and `lazy` without `@hypeup/client` in dependencies
