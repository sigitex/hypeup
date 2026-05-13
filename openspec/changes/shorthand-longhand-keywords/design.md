## Context

The CSS generator's syntax walker in `discoverCss.ts` processes webref property syntaxes using css-tree's `definitionSyntax`. It handles three node types: `Keyword` (direct keyword values like `block`, `none`), `Type` (type references like `<color>` which are expanded via `expandTypeKeywords`), and ignores `Property` nodes (property references like `<'text-decoration-line'>`).

CSS shorthand properties reference their longhands via `Property` nodes. For example, `text-decoration`'s syntax is `<'text-decoration-line'> || <'text-decoration-thickness'> || <'text-decoration-style'> || <'text-decoration-color'>`. Because `Property` nodes are ignored, shorthand properties don't inherit any keywords from their longhands. ~138 properties are affected.

## Goals / Non-Goals

**Goals:**
- Handle `Property` nodes in the syntax walker so shorthand properties gain their longhands' keywords.
- Limit resolution to one level — direct longhand references only, no recursive following.
- Regenerate `primitives.gen.ts` and `css.gen.ts`.

**Non-Goals:**
- Recursive property resolution (following `<'property'>` references multiple levels deep).
- Shorthand value chaining (e.g., `textDecoration.underline.thick.double`) — this is a separate future change.
- Changing how `Type` or `Keyword` nodes are handled.

## Decisions

### 1. Two-pass approach: collect properties first, then resolve references

The walker encounters properties in webref order. A shorthand may be processed before its longhands are collected. To resolve `<'text-decoration-line'>` we need that property's syntax, which may not be in `propLookup` yet.

**Solution:** After the existing webref property loop (which collects all properties and their direct keywords), add a second pass that walks each property's syntax again looking only for `Property` nodes, and pulls keywords from the referenced property's already-parsed values.

**Alternative considered:** Resolving during the first pass with lazy lookups. Rejected — the referenced property might not exist yet, and the code would be more complex for no benefit.

### 2. Pull keywords from the referenced property's collected values, not by re-parsing its syntax

After the first pass, each property already has its `values` array populated with keywords. The second pass can simply iterate `propLookup[refPropertyName].values` and call `addValue` for each one, rather than re-parsing the longhand's syntax.

**Rationale:** Simpler, avoids duplicate parsing, and automatically benefits from any keyword expansion already done (e.g., `Type` expansion via `expandTypeKeywords`).

### 3. Use the referenced property's spec references, not the shorthand's

When adding a longhand keyword to a shorthand, use the keyword's original spec references (from the longhand's `helps` array). This preserves accurate attribution — `textDecoration.underline` should reference `css-text-decor-4`, not whatever spec defines the shorthand itself.

## Risks / Trade-offs

- **[Trade-off] Increased type file size** — Every shorthand gains all its longhands' keywords. This is purely additive and the types aren't bundled with apps, so the size increase is acceptable.
- **[Risk] Keyword name collisions across longhands** — Two longhands of the same shorthand could define the same keyword (e.g., `none`). The `addValue` helper deduplicates by name, so the first one wins. This is acceptable — the keyword has the same CSS meaning regardless of which longhand it came from.
- **[Risk] Ordering dependency** — The second pass must run after ALL properties are collected but before the global keyword injection (from `clean-css-properties`). The CSS-wide keywords should be added last so they appear on both shorthands and longhands.
