## Context

The CSS generator (`discoverCss.ts`) currently pulls from two data sources:
1. `@webref/css` (lines 11-56): Authoritative W3C spec data with syntax definitions. Properties get keywords extracted from their syntax.
2. `known-css-properties` (lines 58-79): A catch-all that adds any property name not already found in webref. These entries have no syntax, so they generate as bare `function foo(value: Content): Property` — no keywords, no dot-syntax.

The `known-css-properties` fallback was presumably added to catch browser-implemented properties not yet in specs. In practice, it adds ~620 entries of noise.

## Goals / Non-Goals

**Goals:**
- Remove `known-css-properties` dependency and its fallback loop from `discoverCss.ts`.
- Inject CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`, `revert-layer`) on every property so `color.unset`, `display.inherit`, etc. work.
- Regenerate `primitives.gen.ts` and `css.gen.ts`.

**Non-Goals:**
- Manually curating a list of useful vendor-specific properties to keep. If a real property is missing from webref, it can be added to a small manual override list later.
- Changing the generator's architecture or how it processes webref data.

## Decisions

### 1. Remove `known-css-properties` entirely

Delete lines 58-79 of `discoverCss.ts` (the fallback loop) and remove the import and dependency.

**Rationale:** Our analysis showed zero useful properties in the delta. The package adds only noise — bogus splits, at-rule descriptors, deprecated properties, and vendor duplicates.

### 2. Inject CSS-wide keywords after property collection, before generation

After the webref property loop, iterate all collected properties and add the five CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`, `revert-layer`) to each property's `values` array (using the existing `addValue` helper with a synthetic "css-cascade-5" spec reference).

**Rationale:** These keywords are defined in CSS Cascading and Inheritance Level 5 as valid for all properties. Adding them at the data level means the existing generator code handles them naturally — properties that previously had no keywords and were plain functions will become `const` declarations with dot-syntax.

**Alternative considered:** Adding them only to properties that already have keywords. Rejected — the spec says they're valid on ALL properties, and having `color.unset` but not `margin.unset` would be inconsistent.

### 3. Skip adding global keywords to the `all` property

The `all` property already has these keywords from webref. The injection loop should check for duplicates (the existing `addValue` helper already deduplicates by name, so no extra code needed).

## Risks / Trade-offs

- **[Risk] A user depends on a removed property name** -> Mitigation: BREAKING change documented. In practice, the removed properties were all unusable (no keywords, bogus names). The fix is to use the correct property name from webref.
- **[Trade-off] Every property now has 5 extra keyword members** -> This increases the generated type file size and the primitive table size. Acceptable — the keywords are genuinely useful and the size impact is modest.
