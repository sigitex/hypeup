## Context

The hypeup babel plugin transforms unbound global identifiers (HTML tags, CSS properties, builtins) into runtime helper calls, eliminating the need for imports. The set of recognized symbols is currently fixed — built from `@hypeup/lexicon/primitives` at plugin init time into a `Map<string, Primitive>` lookup table.

Extension authors and project configs need to register additional symbols that participate in the same transform pipeline. A pending `hypeup.config.ts` change will provide the configuration surface; this change adds the babel plugin's ability to consume extension definitions.

## Goals / Non-Goals

**Goals:**
- Allow extensions to define **aliases** (short name → existing primitive, same transform behavior)
- Allow extensions to define **constants** (bare identifier → fixed `prop(name, value)` expansion)
- Export a `HypeupExtension` type from `@hypeup/babel` for extension authors
- Fail fast on invalid configs (bad alias targets, symbol collisions)
- Extension symbols participate in the unplugin's pre-scan optimization

**Non-Goals:**
- `hypeup.config.ts` integration (separate pending change)
- Type declaration generation for extension symbols (future `@hypeup/generate` utility)
- Constant overloading (constants are not callable — `m4("8px")` is not supported)
- Symbol overwrites (blocked by TypeScript `declare global` conflicts)
- New transform styles beyond alias and constant (e.g., custom transform functions)

## Decisions

### 1. Extensions as the unit of configuration

Extensions are self-contained objects (`HypeupExtension`) with optional `aliases` and `constants` fields. The plugin accepts an array of extensions, not a flat merged bag.

**Rationale**: Extension authors ship a single config object. The aggregation point is the plugin config (and eventually `hypeup.config.ts`). Array ordering is explicit — no implicit merge semantics.

**Alternative considered**: Flat `aliases` and `constants` at the top level of plugin options. Rejected because it doesn't compose well when multiple libraries each ship their own symbol set.

### 2. Aliases reuse existing Primitive entries

An alias like `fs → fontSize` is implemented by looking up `fontSize` in the primitive table and inserting the same `Primitive` value under key `fs`. No new handler code needed — the alias gets identical transform behavior (call form, keyword access, etc.).

**Rationale**: Zero additional handler complexity. Aliases are guaranteed to behave identically to their targets because they *are* the same entry.

### 3. Constants are a new Primitive kind

A new `ConstantPrimitive = { kind: "constant"; cssName: string; value: string }` is added to the `Primitive` union. The handler emits `prop(cssName, value)` — importing `prop` from `@hypeup/runtime` via the existing import cache.

**Rationale**: Constants don't fit any existing kind. They're bare-identifier-only (not callable, no keyword access), and they expand to a fixed two-arg `prop()` call. A dedicated kind keeps the handler simple and the semantics clear.

**Alternative considered**: Encoding constants as `cssProperty` primitives with a default value. Rejected because CSS properties support call form and keyword access — constants intentionally do not.

### 4. Collisions throw at init time

If an extension defines a symbol that collides with a built-in or another extension's symbol, `buildDslPrimitives()` throws immediately.

**Rationale**: Overwrites are not viable because TypeScript's `declare global` blocks would conflict. Fail-fast catches typos and accidental collisions before any files are processed.

### 5. Constants skip call position

If a constant identifier appears as the callee of a `CallExpression`, the handler does nothing (no transform). This prevents nonsensical output like `prop("margin", "4px")("8px")`.

**Rationale**: Constants are definitionally bare-identifier-only. Silently skipping call position is safer than throwing at compile time — the user might have a locally-scoped function with the same name that shadows the constant, and the scope-check would have already caught that case.

## Risks / Trade-offs

- **[Risk] Extensions can't override built-in symbols** → Accepted limitation. TypeScript `declare global` conflicts make this non-viable. Documented as a known constraint.
- **[Risk] Constants limited to `prop()` expansion** → Sufficient for the primary use case (CSS shorthands/tokens). Can be extended later if demand arises for other expansion targets.
- **[Risk] No runtime validation of extension configs** → Mitigated by throwing at plugin init for invalid alias targets and collisions. Structural validation (correct types) is handled by TypeScript at the config authoring site.
