## 1. Type Declaration

- [x] 1.1 In `packages/lexicon/src/core/primitives.ts`, replace `function rule(selector: string, ...contents: Content[]): Rule` with a `const rule` declaration that includes the DSL call signature, CSS property call signature, and an index signature for dot-syntax class access
- [x] 1.2 Add `Property` to the imports from `@hypeup/runtime` in `primitives.ts` (needed for the CSS property overload)

## 2. Generator Update

- [x] 2.1 In `packages/generate/src/generateCss.ts`, filter out the `rule` CSS property from generation so it doesn't conflict with the `const rule` declaration in primitives
- [x] 2.2 Regenerate `packages/lexicon/src/css.gen.ts` to confirm `function rule(value: Content): Property` is removed

## 3. Verification

- [x] 3.1 Run `bun test` in `packages/babel` to confirm existing `rule.active` and `rule.activeItem` transform tests still pass
- [x] 3.2 Run type checking to confirm `rule.someClass(...)` no longer produces TypeScript errors
- [x] 3.3 Verify `rule(".foo", ...)` explicit selector form still type-checks correctly
