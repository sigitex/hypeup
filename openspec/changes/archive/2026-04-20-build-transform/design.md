## Context

The DSL's "globals" (`div`, `color`, `$media`, `rule`, etc.) exist only as type declarations in `@hypeup/lexicon` — they have no runtime implementation. A build plugin is needed to lower every DSL reference into calls against helpers from `@hypeup/runtime`. Without the transform, DSL source code is not executable.

The previous server-side implementation mounted Proxy-backed factories into `globalThis` at process start. That doesn't fit edge runtimes (per-request cold starts, bundle size caps). Routing everything through a build transform collapses both server and client tiers onto one model.

## Goals / Non-Goals

**Goals:**
- Create `@hypeup/babel`: raw Babel plugin with scope-aware AST rewriting
- Create `@hypeup/plugin`: unplugin wrapper with subpath exports for vite/esbuild/rollup/webpack/rspack
- Build primitive lookup table from `@hypeup/lexicon/primitives` data at plugin-init
- Implement all lowering rules (HTML elements, class chains, CSS properties, at-rules, rule, escape hatches)

**Non-Goals:**
- SWC port (future optimization if Babel becomes a bottleneck)
- Runtime global shims (the transform replaces them entirely)
- Compile-time optimization beyond lowering (no dead code elimination, no static analysis)

## Decisions

### 1. Babel for scope-aware AST rewriting

Naive string replacement breaks on local bindings, property access on user objects, string contents, destructuring, and comments. Babel's scope tracker (`path.scope.getBinding(name)`) handles all of these for free.

**Alternative considered:** esbuild/SWC. esbuild plugins operate at the file-loader layer, not AST. SWC plugin API is unstable and requires Rust/Wasm. Babel is the right tool for v0.

### 2. Single `Identifier` visitor

One visitor over all `Identifier` references. For each: skip if locally bound, skip if non-reference position, look up in primitive table, apply the appropriate lowering rule based on surrounding AST shape. Simple, predictable, complete.

### 3. Primitive table from lexicon data

Built at plugin-init from `@hypeup/lexicon/primitives` exports. Four kinds:
- `htmlElement` — `{ tag, isVoid }`
- `atRule` — `{ keyword }`
- `cssProperty` — `{ cssName, keywords }`
- `escapeHatch` — `elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `className`, `cssString`, `doctype`

No TS compiler API. No regex. Just an import.

### 4. Two packages: raw plugin + unplugin wrapper

`@hypeup/babel` is standalone for existing Babel pipelines. `@hypeup/plugin` wraps it with unplugin for bundler integration. Both ship all deps directly — no peer dependencies.

Bun support comes through the esbuild adapter (Bun's `Bun.build({ plugins })` is esbuild-compatible).

### 5. Import injection via `@babel/helper-module-imports`

`addNamed(path, "elem", "@hypeup/runtime")` returns a fresh local identifier even when user code shadows the name. Only helpers actually used in a file are imported. Idempotent per-file.

### 6. Consumer project gate

`@hypeup/plugin` checks for `@hypeup/lexicon` in the consumer's `package.json` at init. If absent, the transformer is inert — prevents transitive tooling from accidentally rewriting identifiers in unrelated projects.

### 7. Lowering rules — all outputs are CallExpressions

- **HTML elements:** `div("hello")` -> `elem("div", ["hello"])`, `br()` -> `elemVoid("br", [])`. Void-ness from lexicon data.
- **Class chains:** `div.active.large("hello")` -> `elem("div", [className("active"), className("large"), "hello"])`. Each segment kebabized.
- **CSS properties (call):** `color("red")` -> `prop("color", "red")`. Name kebabized.
- **CSS properties (keyword):** `zIndex.auto` -> `prop("z-index", "auto")`. Both name and keyword kebabized. Color keywords handled by same rule.
- **At-rules:** `$media("(min-width: 600px)", ...)` -> `atRule("@media", "(min-width: 600px)", [...])`. First string-literal arg hoisted to rule slot.
- **Rule (call):** `rule(".foo", ...)` -> `rule(".foo", [...])`. Element-as-selector: `rule(div, ...)` -> `rule("div", [...])`.
- **Rule (class access):** `rule.active(...)` -> `rule(".active", [...])`. Name kebabized.
- **Escape hatches:** `elem`, `prop`, `raw`, `cssString`, `className`, `attr` -> import from runtime. `doctype.html5` -> `raw("<!DOCTYPE html>")`.

## Risks / Trade-offs

- **[Babel performance]** Slower than native parsers. -> Mitigation: Cheap string pre-scan to skip files with no DSL references. SWC port is a future option.
- **[Scope analysis edge cases]** Complex destructuring or re-exports could confuse scope tracking. -> Mitigation: Babel's scope tracker is battle-tested; snapshot tests cover edge cases.
- **[Two packages to maintain]** `@hypeup/babel` + `@hypeup/plugin`. -> Mitigation: Plugin is thin wrapper. Core logic lives in babel package only.
- **[Prerequisite: lexicon-restructure]** Needs `@hypeup/lexicon/primitives` subpath. -> Mitigation: That change is planned first.

## Open Questions

- Dynamic args: `div(...someArray)` -> `elem("div", [...someArray])`. Verify spread edge cases in snapshot tests.
- Source maps: Babel handles this; verify with a debugger session.
