## Why

The DSL's "globals" (`div`, `color`, `$media`, `rule`, etc.) exist only as type declarations in `@hypeup/lexicon` — they have no runtime implementation. A Babel-based build plugin is needed to lower every DSL reference into calls against the helpers exported from `@hypeup/runtime`. Without the transform, DSL source code is not executable. This replaces the deleted Proxy-backed factory system and eliminates runtime globals entirely.

The transformer runs for both server and client tiers — no runtime global shims, no per-request cold-start cost on edge runtimes.

See: `docs/plan-build-transform.md`

## What Changes

- **Create `@hypeup/babel`**: Raw Babel plugin. Single `Identifier` visitor with scope-aware rewriting. Depends on `@babel/core`, `@babel/types`, `@babel/helper-module-imports`. Imports primitive data from `@hypeup/lexicon/primitives` at plugin-init to build the lookup table.
- **Create `@hypeup/plugin`**: unplugin-based wrapper with subpath exports for vite/esbuild/rollup/webpack/rspack. Bun support via the esbuild adapter. Checks for `@hypeup/lexicon` in consumer's `package.json` at init — if absent, transformer is inert.
- **Primitive table**: Built from lexicon data. Four kinds: `htmlElement` (tag + isVoid), `atRule` (keyword), `cssProperty` (cssName + keywords), `escapeHatch` (elem, elemVoid, prop, attr, raw, rule, className, cssString, doctype).
- **Lowering rules** (all outputs are `CallExpression`s against `@hypeup/runtime` imports):
  - HTML elements: `div("hello")` -> `elem("div", ["hello"])`, `br()` -> `elemVoid("br", [])`. Void-ness from lexicon data.
  - Class chains: `div.active.large("hello")` -> `elem("div", [className("active"), className("large"), "hello"])`. Each segment kebabized, one `className()` per segment.
  - CSS properties call form: `color("red")` -> `prop("color", "red")`. Name kebabized.
  - CSS properties keyword access: `zIndex.auto` -> `prop("z-index", "auto")`. Both name and keyword kebabized. Color keywords (`color.red`) handled by same rule.
  - At-rules: `$media("(min-width: 600px)", ...)` -> `atRule("@media", "(min-width: 600px)", [...])`. Keyword from lookup table. First string-literal arg hoisted to rule slot.
  - Rule call form: `rule(".foo", ...)` -> `rule(".foo", [...])`. Element-as-selector: `rule(div, ...)` -> `rule("div", [...])`.
  - Rule class access: `rule.active(...)` -> `rule(".active", [...])`. Name kebabized.
  - Escape hatches: `elem`, `prop`, `raw`, `cssString`, `className`, `attr` -> import from runtime. `doctype.html5` -> `raw("<!DOCTYPE html>")`.
- **Import injection**: Uses `@babel/helper-module-imports`'s `addNamed()` for collision-safe imports. Only helpers actually used are imported. Idempotent per-file.
- **Scope safety**: `path.scope.getBinding(name)` non-null -> skip. Locally-bound `div`, destructured `color`, etc. are never rewritten.
- **Plugin wrapper responsibilities**: File filter (`/\.[jt]sx?$/`, exclude `node_modules`), cheap string pre-scan for short-circuit, `babel.transformAsync()`, source maps forwarded, `@babel/preset-typescript` + JSX syntax defaults.

## Capabilities

### New Capabilities
- `babel-plugin`: Raw Babel plugin that lowers DSL identifiers to `@hypeup/runtime` helper calls via scope-aware AST rewriting
- `unplugin-wrapper`: Bundler-agnostic wrapper with subpath exports for vite/esbuild/rollup/webpack/rspack
- `primitive-table`: Lookup table built from `@hypeup/lexicon/primitives` data at plugin-init

### Modified Capabilities
- None

## Impact

- **New packages**: `@hypeup/babel` (raw plugin), `@hypeup/plugin` (unplugin wrapper). All deps shipped directly — no peer dependencies.
- **Prerequisites**: Requires `lexicon-restructure` to be complete (needs `@hypeup/lexicon/primitives` subpath export).
- **Consumer build configs**: Projects add the plugin to their build pipeline. No runtime globals needed. Emitted JS contains zero Proxy traps, zero factory closures, zero global lookups.
- **`@hypeup/lexicon`**: After this change, the global `declare` types are fulfilled by the transformer, not by runtime shims.
- **Perf**: Babel is acceptable for small-to-medium projects. SWC port (`@hypeup/swc`) is an option later if profiling shows Babel as a bottleneck.
