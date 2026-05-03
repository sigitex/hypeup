## Why

The `@hypeup/lexicon` package still ships runtime implementations in `primitives.ts` (`elem`, `prop`, `raw`, `cssString`, a Proxy-backed `rule`) that duplicate helpers now in `@hypeup/runtime`, and directly depends on `cssesc` (which runtime now owns). The generated type declarations (`html.gen.ts`, `css.gen.ts`) reference the deleted `ElementBuilder` type. Lexicon needs to become a `devDependency`-only package: pure type declarations plus a generated runtime data file consumed by the build transformer.

See: `docs/plan-lexicon.md`

## What Changes

- **Replace `src/primitives.ts` with `src/primitives.d.ts`**: Delete all runtime implementations. Replace with ambient `declare global` declarations for the escape-hatch globals (`elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `className`, `cssString`, `doctype`), importing types from `@hypeup/runtime`. Trailing `export {}` to make the file a module.
- **Create `src/index.ts`**: Side-effect imports `./html.gen`, `./css.gen`, and `./primitives` to merge `declare global` blocks into consumer scope.
- **Generator: emit `src/primitives.gen.ts`**: New generated runtime file exporting `htmlTags`, `voidHtmlTags`, `atRules`, `cssProperties` as `const` objects/arrays. This is the machine-readable data the build transformer imports at plugin-init. The generator already has this data in its discovery phase — this is a serialization pass alongside the type declarations.
- **Generator: update `html.gen.ts`**: Stop importing `ElementBuilder`. Element declarations become simple function signatures matching the DSL surface (e.g., `function div(...contents: Content[]): Element`).
- **Generator: update `css.gen.ts`**: Import types from `@hypeup/runtime` instead of `@hypeup/vdom`.
- **`package.json` subpath export**: `"."` -> `./src/index.ts` (pure types, side-effect imports); `"./primitives"` -> `./src/primitives.gen.ts` (runtime data for the transformer).
- **Remove dependencies**: Drop `cssesc`, `@types/cssesc`, and runtime `@hypeup/vdom` dependency. The `.d.ts` file only needs `import type` from `@hypeup/runtime`.

## Capabilities

### New Capabilities
- `lexicon-primitives-gen`: Generated runtime data file (`primitives.gen.ts`) exporting `htmlTags`, `voidHtmlTags`, `atRules`, `cssProperties` for build-transform consumption via `@hypeup/lexicon/primitives` subpath.

### Modified Capabilities
- `lexicon-primitives`: Becomes `primitives.d.ts` — pure ambient declarations, no runtime code
- `lexicon-html-gen`: Element declarations use function signatures instead of `ElementBuilder`
- `lexicon-css-gen`: Types imported from `@hypeup/runtime` instead of `@hypeup/vdom`

## Impact

- **`@hypeup/lexicon`**: Becomes `devDependency`-only for consumers. Zero runtime code, zero production bundle impact. Single `import "@hypeup/lexicon"` (or `/// <reference types="@hypeup/lexicon" />`) pulls ambient globals into TS scope.
- **`@hypeup/generate`**: Generator gains a third output (`primitives.gen.ts`) alongside `html.gen.ts` and `css.gen.ts`. Templates updated to stop referencing `ElementBuilder`.
- **Downstream**: Consumer `package.json` moves lexicon to `devDependencies`. `cssesc` no longer installed transitively. Global type declarations change shape (function signatures instead of `ElementBuilder`).
- **Build transformer**: Prerequisite — the transformer (next change) imports from `@hypeup/lexicon/primitives` to build its primitive table.
