## Context

The hypeup DSL exposes HTML elements and CSS properties as ambient globals, avoiding explicit imports. CSS values like `"10px"` or `"rgb(255, 0, 0)"` still require string construction. The generator discovers HTML elements from `html-tags`, CSS properties from `@webref/css`, and uses `css-tree` for syntax parsing. Collision handling for JS reserved words currently uses underscore prefixes (`_var`, `_continue`).

The `css-tree` package (already a dependency of `@hypeup/generate`) provides a structured `lexer.units` object with all CSS units organized by category. Color function signatures are well-defined in the CSS Color specifications.

## Goals / Non-Goals

**Goals:**
- Generate ambient global functions for all CSS units from `lexer.units` (63 units, 7 categories).
- Generate ambient global functions for the standard CSS color constructors: `rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`.
- Generate an ambient global `url` function.
- All helpers return `string` — no branded types.
- Migrate the collision convention from `_prefix` to `$suffix` across all generated code.
- Signatures mirror CSS function arguments (e.g., alpha as optional last param for color functions).

**Non-Goals:**
- `calc()`, `var()`, gradients, `color-mix()`, `light-dark()`, or other complex CSS functions.
- Branded return types (`Color`, `Length`, etc.) — the vdom works with plain strings.
- Recursive or dynamic unit discovery beyond `lexer.units`.
- Runtime validation of argument values.

## Decisions

### 1. Source units from `css-tree`'s `lexer.units`

The `lexer.units` object provides 63 units across 7 categories (length, angle, time, frequency, resolution, flex, decibel) as structured data. This is already a dependency.

**Alternative considered:** Hardcoding a curated unit list. Rejected — `lexer.units` is comprehensive, maintained, and automatically reflects CSS spec updates.

### 2. Curate color functions rather than generating from webref

Webref lists 162 CSS functions, most of which are not value constructors (layout, math, meta). The 7 color constructors (`rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`) and `url` are hand-picked based on the criteria: produces a single CSS value string, benefits from avoiding template interpolation.

**Alternative considered:** Generating from webref's function list with filters. Rejected — the relevant set is small, stable, and requires curated signatures that can't be derived from webref data.

### 3. Color function signatures mirror CSS with positional args

Each color function takes 3 required numeric args plus an optional alpha:
- `rgb(r: number, g: number, b: number, a?: number): string` → `"rgb(r g b)"` or `"rgb(r g b / a)"`
- `hsl(h: number, s: number, l: number, a?: number): string` → `"hsl(h s l)"` or `"hsl(h s l / a)"`
- Same pattern for `hwb`, `lab`, `lch`, `oklab`, `oklch`.

Uses modern CSS space-separated syntax (not legacy comma-separated).

**Alternative considered:** Accepting an object `{ r, g, b, a }`. Rejected — positional args mirror CSS function syntax directly, which is the stated goal.

### 4. Use `$` suffix for collision avoidance

When a generated global name collides with an existing global or JS reserved word, append `$`. This replaces the current `_` prefix convention.

Collisions requiring `$` suffix:
- **Units vs HTML elements:** `em$`, `q$`, `s$`
- **Units vs CSS keywords:** `ex$`, `cap$`, `x$`
- **Units vs JS reserved words:** `in$`
- **HTML elements vs JS reserved words:** `var$` (was `_var`)
- **CSS properties vs JS reserved words:** `continue$`, `default$`, `super$`, `break$` (were `_continue`, `_default`, `_super`, `_break`)

**Alternative considered:** Type-specific suffixes (`_unit`, `_el`, `_prop`). Rejected — a single `$` suffix is simpler and sufficient since `var()` was dropped from scope, eliminating the only double-collision case.

### 5. Unit discovery and collision detection at generation time

The generator will:
1. Collect all unit names from `lexer.units`.
2. Compare against already-collected HTML element names and CSS property/keyword names.
3. Apply `$` suffix to any unit that collides.
4. Generate type declarations and primitive table entries.

This is done during the existing generation phase — no separate discovery step.

### 6. Generated output structure

- **Type declarations:** Add a new `values.gen.ts` file in `@hypeup/lexicon` declaring unit functions, color functions, and `url` as ambient globals in a `declare global` block.
- **Primitive table:** Extend `primitives.gen.ts` with a `cssUnits` export (mapping JS names to unit strings) and a `cssFunctions` export (mapping JS names to function names).
- **Runtime implementations:** The babel plugin uses the primitive table to transform calls like `px(10)` into the string `"10px"` at build time, or the runtime provides simple helper functions as fallbacks.

### 7. Drop deprecated color function aliases

`rgba` and `hsla` are not generated. Modern `rgb` and `hsl` accept an optional alpha parameter, making the aliases unnecessary.

## Risks / Trade-offs

- **[Trade-off] 63 new globals** — Increases the global namespace significantly. Acceptable because the DSL already commits to this pattern for HTML elements (~100) and CSS properties (~600).
- **[Trade-off] `$` suffix is unusual** — Developers may not immediately discover `em$` when `em` is taken by the HTML element. Doc comments on the HTML `em` element could mention the unit alternative. The `$` convention is at least consistent across all collision types.
- **[Risk] `lexer.units` could change across css-tree versions** — Units could be added or removed. This is acceptable — regeneration picks up changes, and CSS units are very stable.
- **[Risk] Renaming `_var` to `var$` etc.** — Existing code using `_var` or `_continue` will break. Acceptable since the framework is experimental with no external consumers.
