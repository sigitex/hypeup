## 1. Lexicon Package Restructure

- [x] 1.1 Delete `src/primitives.ts` and create `src/primitives.d.ts` with ambient `declare global` declarations importing types from `@hypeup/runtime`
- [x] 1.2 Create `src/index.ts` with side-effect imports of `./html.gen`, `./css.gen`, and `./primitives`
- [x] 1.3 Update `package.json`: remove `cssesc`, `@types/cssesc`, `@hypeup/vdom` deps; set subpath exports (`"."` → `./src/index.ts`, `"./primitives"` → `./src/primitives.gen.ts`)

## 2. Generator: HTML Output

- [x] 2.1 Update `generateHtml.ts` to emit `import type { Element } from "@hypeup/runtime"` instead of `ElementBuilder` from `@hypeup/vdom`
- [x] 2.2 Update `generateHtml.ts` to emit `function <name>(...contents: Content[]): Element` signatures instead of `const <name>: ElementBuilder`

## 3. Generator: CSS Output

- [x] 3.1 Update `generateCss.ts` to emit `import type { Property, AtRule } from "@hypeup/runtime"` instead of from `@hypeup/vdom`

## 4. Generator: Primitives Data Output

- [x] 4.1 Create `generatePrimitives.ts` that serializes discovered HTML tags, void tags, at-rules, and CSS properties into a `primitives.gen.ts` runtime data file
- [x] 4.2 Update `generate.ts` entry point to call `generatePrimitives()` and write `src/primitives.gen.ts`

## 5. Regenerate and Verify

- [x] 5.1 Run the generator to produce updated `html.gen.ts`, `css.gen.ts`, and new `primitives.gen.ts`
- [x] 5.2 Verify no TypeScript errors in the lexicon package (`tsc --noEmit`)
