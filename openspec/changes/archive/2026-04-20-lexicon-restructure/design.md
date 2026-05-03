## Context

`@hypeup/lexicon` currently ships runtime implementations in `src/primitives.ts` (factory functions using `@hypeup/vdom` classes + `cssesc` dependency) alongside generated type declarations (`html.gen.ts`, `css.gen.ts`). The generated files reference a deleted `ElementBuilder` type from `@hypeup/vdom`. The package's `exports` field points at a nonexistent `src/index.ts`.

`@hypeup/runtime` now owns all the runtime helpers (`elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `className`, `cssString`) and the `cssesc` dependency. Lexicon's runtime code is dead weight that duplicates runtime.

The generator (`@hypeup/generate`) produces `html.gen.ts` and `css.gen.ts` but has no mechanism to emit runtime data for the build transformer.

## Goals / Non-Goals

**Goals:**
- Make `@hypeup/lexicon` a pure `devDependency` package: zero runtime code, zero production bundle impact
- Fix broken `ElementBuilder` references in generated output
- Provide machine-readable runtime data (`primitives.gen.ts`) for the build transformer via subpath export
- Establish `src/index.ts` as the proper entry point with side-effect imports

**Non-Goals:**
- Changing `@hypeup/runtime` internals (already restructured)
- Implementing the build transformer itself (next change, consumes `@hypeup/lexicon/primitives`)
- Modifying `@hypeup/vdom` (no changes needed there)

## Decisions

### 1. `primitives.ts` becomes `primitives.d.ts` with ambient declarations

Replace the runtime file with a `declare global` ambient declaration file. Import types from `@hypeup/runtime` (not `@hypeup/vdom`) since runtime is the public API surface. Trailing `export {}` makes it a module for correct global merging.

**Why not keep runtime code?** Runtime owns the implementations now. Duplicating them in lexicon means two places to update and a transitive `cssesc` dependency that reaches consumers.

### 2. Generator emits function signatures instead of `ElementBuilder`

`html.gen.ts` currently declares each HTML tag as `const div: ElementBuilder`. This type no longer exists. Replace with function signatures: `function div(...contents: Content[]): Element`. Use rest params to match the DSL calling convention.

Void elements get the same signature but return `Element` with `isVoid: true` semantics (the type system doesn't distinguish void vs non-void at the Element level — classification handles it).

**Alternative considered:** A new `ElementFactory` type alias. Rejected — function signatures are simpler, self-documenting, and don't introduce another type to maintain.

### 3. `css.gen.ts` imports from `@hypeup/runtime` instead of `@hypeup/vdom`

The generated CSS declarations currently import `Property` and `AtRule` from `@hypeup/vdom`. Switch to `@hypeup/runtime` to align with the public API surface. Both re-export the same classes, but runtime is the intended consumer-facing package.

### 4. New `primitives.gen.ts` as a separate generated output

The generator already discovers all HTML tags, void tags, at-rules, and CSS properties during its discovery phase. Add a serialization pass that writes this data as typed `const` exports. This file is the only runtime code in lexicon — it's consumed exclusively by the build transformer at plugin-init, never by application code.

Exposed via subpath export `"./primitives"` → `./src/primitives.gen.ts`.

### 5. Package dependency cleanup

- Remove `cssesc` and `@types/cssesc` (owned by runtime now)
- Replace `@hypeup/vdom` dependency with `@hypeup/runtime` (type-only usage via `import type`)
- Keep `@hypeup/generate` as devDependency (runs the generator)

### 6. `src/index.ts` with side-effect imports

```ts
import "./html.gen"
import "./css.gen"
import "./primitives"
```

This merges all `declare global` blocks into consumer scope. The `exports` field already points here — the file just needs to exist.

## Risks / Trade-offs

- **[Breaking change for downstream]** Global type shapes change (function signatures vs `ElementBuilder`). → Mitigation: `ElementBuilder` is already broken (type doesn't exist), so consumers are already broken. This fixes them.
- **[Generator must run before lexicon works]** The `.gen.ts` files are checked in, so this is the existing workflow. No new risk.
- **[Two subpath exports to document]** `"."` for types, `"./primitives"` for transformer data. → Mitigation: Only the transformer imports `./primitives`; consumers use the default import.

## Open Questions

- `Content` and `RuleContent` types in `primitives.d.ts`: use `any` (matching current runtime) or define proper union types? Current runtime uses `Content = any`. Match runtime for now; tighten later.
