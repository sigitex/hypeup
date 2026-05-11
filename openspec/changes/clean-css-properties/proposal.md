## Why

The CSS property generator pulls from two sources: `@webref/css` (authoritative W3C spec data with syntax definitions) and `known-css-properties` (a list scraped from browser implementations). The `known-css-properties` fallback adds ~620 entries of noise — bogus split properties (`text-decoration-underline`), at-rule descriptors misidentified as properties, deprecated IE/aural properties, and vendor-prefixed duplicates — all without keyword data since they have no syntax definitions. These pollute the generated types with useless `function foo(value: Content): Property` entries.

Separately, CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`, `revert-layer`) are only generated on the `all` property because that's the only property where `@webref/css` lists them. In reality, these keywords are valid on every CSS property and should be available via dot-syntax (e.g., `color.unset`, `display.inherit`).

## What Changes

- **Remove `known-css-properties` dependency** from `@hypeup/generate`. The `@webref/css` data is the sole source of CSS property definitions. This removes ~620 bogus/useless property entries from the generated output. **BREAKING**: any code using these removed properties will get compile errors. In practice, none of these are useful.
- **Add CSS-wide keywords to all properties**. After collecting properties from `@webref/css`, inject `initial`, `inherit`, `unset`, `revert`, and `revert-layer` as keywords on every property. This means every property gains dot-syntax access for these values (e.g., `color.unset`, `display.inherit`, `margin.revert`).
- **Regenerate `primitives.gen.ts` and `css.gen.ts`** with the cleaned data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `lexicon-css-gen`: The CSS generation pipeline changes its data sources and adds global keywords.

## Impact

- **`@hypeup/generate`**: `discoverCss.ts` — remove `known-css-properties` import and fallback loop (lines 58-79). Add global keyword injection after property collection.
- **`@hypeup/generate`**: `package.json` — remove `known-css-properties` dependency.
- **`@hypeup/lexicon`**: `primitives.gen.ts` and `css.gen.ts` — regenerated with fewer properties but richer keyword support.
- **BREAKING**: ~620 properties removed from generated types. These are all bogus, deprecated, or vendor-prefixed duplicates — no real-world usage expected.
