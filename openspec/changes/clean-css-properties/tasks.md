## 1. Remove known-css-properties

- [ ] 1.1 Remove `import { all as knownCssProperties } from "known-css-properties"` from `discoverCss.ts`
- [ ] 1.2 Remove the fallback loop (lines 58-79) that adds properties from `known-css-properties`
- [ ] 1.3 Remove `known-css-properties` from `@hypeup/generate` `package.json` dependencies
- [ ] 1.4 Run `bun install` to update lockfile

## 2. Inject CSS-wide keywords

- [ ] 2.1 After the webref property collection loop in `discoverCss.ts`, add a loop that injects `initial`, `inherit`, `unset`, `revert`, `revert-layer` as keyword values on every property using the existing `addValue` helper
- [ ] 2.2 Use a synthetic spec reference like `{ shortName: "css-cascade-5", title: "CSS Cascading 5" }` for the keyword help entries
- [ ] 2.3 Verify `addValue` deduplicates correctly (the `all` property already has these keywords from webref)

## 3. Regenerate lexicon

- [ ] 3.1 Run the generator to regenerate `primitives.gen.ts`
- [ ] 3.2 Run the generator to regenerate `css.gen.ts`
- [ ] 3.3 Verify bogus properties (e.g., `textDecorationUnderline`) are gone from generated output
- [ ] 3.4 Verify a previously keyword-less property like `textDecoration` now has `initial`, `inherit`, `unset`, `revert`, `revertLayer` keywords
- [ ] 3.5 Verify the `all` property has no duplicate keywords

## 4. Validate

- [ ] 4.1 Run existing tests to ensure nothing breaks
- [ ] 4.2 Build the lexicon package to verify generated types compile
- [ ] 4.3 Verify the primitive table in the babel plugin still works (property count will decrease)
