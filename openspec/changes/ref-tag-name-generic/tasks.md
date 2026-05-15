## 1. Widen Ref class constraint

- [ ] 1.1 In `packages/vdom/src/Ref.ts`, change `T extends HTMLElement = HTMLElement` to `T extends Element = Element`

## 2. Update ref function signature

- [ ] 2.1 In `packages/client/src/ref.ts`, add `AllTags` and `ResolveTag` type aliases
- [ ] 2.2 In `packages/client/src/ref.ts`, change the `ref` function signature to `ref<K extends AllTags = AllTags>(): Ref<ResolveTag<K>>`

## 3. Update global declaration

- [ ] 3.1 In `packages/lexicon/src/primitives.ts`, add `AllTags` and `ResolveTag` type declarations inside the `declare global` block
- [ ] 3.2 In `packages/lexicon/src/primitives.ts`, update the `ref` function declaration to use the new tag name generic signature

## 4. Update usage sites

- [ ] 4.1 In `examples/todomvc/src/TodoItem.ts`, change `ref<HTMLInputElement>()` to `ref<"input">()`
- [ ] 4.2 In `packages/client/src/mount.test.ts`, update any typed `ref` calls to use tag name strings

## 5. Verify

- [ ] 5.1 Run TypeScript type checking across the workspace to confirm no type errors
- [ ] 5.2 Run existing tests to confirm no runtime regressions

## 6. Documentation

- [ ] 6.1 Update the `ref` example in the Refs section of `README.md` from `ref<HTMLInputElement>()` to `ref<"input">()`
