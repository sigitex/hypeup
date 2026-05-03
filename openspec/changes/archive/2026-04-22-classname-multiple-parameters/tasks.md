## 1. Runtime Implementation

- [x] 1.1 Update `className` in `runtime/src/helpers.ts` to accept `(...names: [string, ...string[]])` and return `CssClass[]` via `names.map(n => new CssClass(n))`
- [x] 1.2 Update the global type declaration in `lexicon/src/primitives.ts` to match the new signature: `function className(...names: [string, ...string[]]): CssClass[]`

## 2. Tests

- [x] 2.1 Add test case for `className` with a single argument returning a one-element `CssClass[]`
- [x] 2.2 Add test case for `className` with multiple arguments returning correctly ordered `CssClass[]`
- [x] 2.3 Verify existing classifier tests still pass (no changes expected — arrays already flatten)

## 3. Spec Update

- [x] 3.1 Archive the delta spec into `openspec/specs/runtime-helpers/spec.md` via `openspec archive`
