## Why

CSS shorthand properties like `text-decoration`, `overflow`, `outline`, and `list-style` reference their longhands via `<'property-name'>` syntax in the W3C specs. The generator's syntax walker handles `Keyword` and `Type` nodes but ignores `Property` nodes, so shorthand properties don't inherit their longhands' keywords. This means `textDecoration.underline` doesn't work — you have to know to use `textDecorationLine.underline` instead. This is unintuitive since `text-decoration: underline` is valid and extremely common CSS.

## What Changes

- **Resolve `Property` node references in shorthand syntaxes**. When the css-tree syntax walker encounters a `Property` node (e.g., `<'text-decoration-line'>`), look up that property's syntax and extract its keywords. This is limited to one level of resolution — no recursive following of property references.
- **Regenerate `primitives.gen.ts` and `css.gen.ts`** with the expanded keyword sets.
- ~138 shorthand properties gain keywords from their direct longhands.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `lexicon-css-gen`: Shorthand properties gain keywords from their direct longhand property references.

## Impact

- **`@hypeup/generate`**: `discoverCss.ts` — add `Property` node handling in the syntax walker, with a lookup into already-collected property data.
- **`@hypeup/lexicon`**: `primitives.gen.ts` and `css.gen.ts` — regenerated with more keywords on shorthand properties. Type file size increases moderately.
- **Not breaking**: Only additive — existing properties keep all their current keywords, shorthands just gain more.
