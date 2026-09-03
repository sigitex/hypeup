## Context

The hypeup babel plugin transforms unbound global identifiers (HTML tags, CSS properties, builtins) into runtime helper calls, eliminating the need for imports. The set of recognized symbols is currently fixed — built from `@hypeup/lexicon/primitives` at plugin init time into a `Map<string, Primitive>` lookup table.

Extension authors and project configs need to register additional symbols that participate in the same transform pipeline. A pending `hypeup.config.ts` change will provide the configuration surface; this change adds the babel plugin's ability to consume extension definitions.

## Goals / Non-Goals

**Goals:**
- Allow extensions to define **aliases** (short name mapped to existing primitive or extension-defined symbol, same transform behavior)
- Allow extensions to define **prop constants** (bare identifier expands to fixed `prop(css, value)`)
- Allow extensions to define **className constants** (bare identifier expands to fixed `className(value)`)
- Allow extensions to define **element constants** (identifier expands to `elem(tag, [...prebaked, ...user])` with optional className, props, attrs)
- Support **dotted-path keys** as first-class table entries with longest-match-first lookup
- Export `HypeupExtension` and `ExtensionSymbol` types from `@hypeup/babel`
- Fail fast on invalid configs (bad alias targets, symbol collisions)
- Extension symbols participate in the unplugin's pre-scan optimization

**Non-Goals:**
- `hypeup.config.ts` integration (separate pending change)
- Type declaration generation for extension symbols (future `@hypeup/generate` utility)
- Constant overloading (prop/className constants are not callable)
- Symbol overwrites (blocked by TypeScript `declare global` conflicts)
- Custom transform functions (extensions declare data, not behavior)

## Decisions

### 1. Flat extension shape with type discriminator

A `HypeupExtension` is a flat `Record<string, ExtensionSymbol>` where each key is an identifier name (possibly dotted) and each value is a discriminated union by `type`: `"alias"`, `"prop"`, `"className"`, or `"element"`.

**Rationale**: Dotted-path keys are first-class and apply to any symbol type. Separate fields (`aliases`, `constants`, `elements`) would mean duplicating dotted-path support or restricting it to one field. Single namespace gives one collision check. See ADR-0002.

**Alternative considered**: Separate fields per kind. Rejected — doesn't compose with dotted paths.

### 2. Aliases reuse existing Primitive entries

An alias like `fs` targeting `fontSize` is implemented by looking up `fontSize` in the primitive table and inserting the same `Primitive` value under key `fs`. Aliases can target built-in primitives or extension-defined symbols (resolved in array order).

**Rationale**: Zero handler complexity. Aliases behave identically to targets because they *are* the same entry.

### 3. Four extension symbol types

- `"alias"`: `{ type: "alias"; target: string }` — resolved to target's Primitive entry
- `"prop"`: `{ type: "prop"; css: string; value: string }` — expands to `prop(css, value)`, bare-identifier-only
- `"className"`: `{ type: "className"; value: string }` — expands to `className(value)`, bare-identifier-only
- `"element"`: `{ type: "element"; tag: string; className?: string; props?: Record<string, string>; attrs?: Record<string, string | boolean> }` — expands to `elem(tag, [...prebaked, ...user])`, void inferred from tag

**Rationale**: Each type maps to a distinct transform output. Discriminated union keeps handlers simple and types precise.

### 4. Dotted-path lookup with longest-match-first

Dotted keys (e.g., `"container.sm"`, `"m4.x"`) are stored as-is in the primitive table. When the Identifier visitor encounters a member-expression chain rooted at a known identifier, it builds the full dotted path and tries progressively shorter prefixes until a match is found. Remaining unmatched segments become classNames (for element types only).

**Rationale**: Independent entries per dotted path. No separator/join strategy. Extension author controls exactly what each path expands to. See ADR-0001.

**Key rules**:
- Unlimited depth
- No root entry required — `"m4.x"` can exist without `"m4"`
- Scope shadowing of root identifier suppresses entire chain
- Implemented inside existing Identifier visitor, not a separate MemberExpression visitor
- Dot-segment fallback (unmatched segments become classNames) only applies to element symbols and aliases targeting element-like primitives

### 5. Prebaked children ordering

Element symbols inject children in this order: prebaked (className, props, attrs), then dot-segment classNames, then user arguments.

**Rationale**: Mirrors HTML element handling. Prebaked children are conceptually "before" user-supplied content. Ordering within siblings is semantically irrelevant.

### 6. Collisions throw at init time

If an extension defines a symbol key that collides with a built-in or another extension's symbol, `buildDslPrimitives()` throws immediately.

**Rationale**: Overwrites are not viable (TypeScript `declare global` conflicts). Fail-fast catches typos and accidental collisions before any files are processed.

### 7. Prop/className constants skip call position and have no dot-segment fallback

If a prop or className constant appears as callee of a CallExpression, no transform. If it appears as object of a MemberExpression with no dotted-path match, no transform.

**Rationale**: Constants are bare-identifier-only. Silently skipping is safer than compile-time errors — user might have a locally-scoped function with the same name.

### 8. Pre-scan uses root segments

The unplugin pre-scan identifier set includes the root segment of every dotted-path key. `"container.sm"` contributes `container` to the scan set. Conservative (may process extra files) but correct.

**Rationale**: Can't regex-match dotted paths as single tokens in source text.

## Risks / Trade-offs

- **[Risk] Extensions can't override built-in symbols** — Accepted limitation. TypeScript `declare global` conflicts make this non-viable.
- **[Risk] No runtime validation of extension configs** — Mitigated by init-time throws for invalid alias targets and collisions. Structural validation handled by TypeScript.
- **[Risk] Dotted-path lookup adds complexity to Identifier visitor** — Mitigated by keeping it as a pre-check before existing `handlePrimitive()` dispatch. Longest-match is just hash map lookups.
- **[Risk] Element constants with prebaked props/attrs could encourage putting too much in plugin config** — Accepted. The feature is opt-in. Complex components should be actual components, not element constants.
