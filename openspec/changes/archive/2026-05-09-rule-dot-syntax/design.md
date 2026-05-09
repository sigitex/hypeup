# Design: Rule Dot-Syntax Type Support

## Overview

Add TypeScript type support for the existing `rule.className(...)` babel transform. The babel plugin already converts `rule.active(...)` to `rule(".active", ...)` at compile time. This change adds the type declaration so TypeScript doesn't report errors.

The key constraint is that `rule` is declared in two places in the global scope:
- `packages/lexicon/src/core/primitives.ts:25` — DSL rule: `function rule(selector: string, ...contents: Content[]): Rule`
- `packages/lexicon/src/css.gen.ts:8163` — CSS property: `function rule(value: Content): Property`

TypeScript merges these as function overloads. Changing to `const` would break that merge.

## Changes

### `packages/lexicon/src/core/primitives.ts`

Replace the `function rule` declaration with a `const rule` that includes both the DSL call signature, the CSS property call signature, and an index signature for dot-syntax class access:

```ts
// Before:
function rule(selector: string, ...contents: Content[]): Rule

// After:
const rule: {
  /** Create a CSS rule with a selector. */
  (selector: string, ...contents: Content[]): Rule
  /** Create a `rule` CSS property. `css-gaps-1` */
  (value: Content): Property
  /** Dot-syntax class selector shorthand: `rule.active(...)` becomes `rule(".active", ...)` */
  [className: string]: (...contents: Content[]) => Rule
}
```

### `packages/generate/src/generateCss.ts`

Add a filter to skip emitting the CSS `rule` property declaration, since it is now absorbed into the `const rule` declaration in `primitives.ts`. The generator should check if a property name collides with a core primitive and skip it:

```ts
// In generateProperty or the .each(properties, ...) loop:
// Skip properties whose jsName conflicts with core primitives
const corePrimitives = new Set(["rule"])

// ...
.each(properties.filter(p => !corePrimitives.has(p.jsName)), generateProperty)
```

### `packages/generate/src/generatePrimitives.ts`

No changes needed. The primitives generator produces `primitives.gen.ts` which contains tag lists and property maps, not type declarations.

## Edge Cases

### Backward compatibility
- `rule(".foo", ...)` — unchanged, still works via the first call signature
- `rule(div, ...)` — unchanged, the `selector: string` overload still matches since `div` is transformed to a string by babel
- `rule(value)` — CSS property overload preserved in the new `const` declaration
- Existing code using `rule.active(...)` that suppressed TS errors will just stop showing errors

### Index signature return type
The index signature returns `(...contents: Content[]) => Rule`, not `Property`. This is correct because `rule.active(...)` is always a class-selector shorthand (CSS rule), never a CSS property access. CSS sub-properties like `ruleColor`, `ruleBreak` are separate identifiers — they don't go through `rule.color`.

### camelCase to kebab-case
The babel plugin already handles `rule.activeItem` → `rule(".active-item", ...)` via its `kebab()` helper. No additional type-level work needed — the index signature accepts any string key.

## Testing

1. **Existing tests pass**: Run `bun test` in `packages/babel` — the existing `rule.active` and `rule.activeItem` transform tests should still pass
2. **Type checking**: Create a `.ts` file using `rule.someClass(...)` and verify `tsc` produces no errors
3. **CSS property overload**: Verify `rule("2px")` still type-checks as `Property`
