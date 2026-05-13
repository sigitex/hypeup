## 1. Add longhand keyword resolution

- [ ] 1.1 After the existing webref property loop in `discoverCss.ts`, add a second pass that walks each property's syntax looking for `Property` nodes
- [ ] 1.2 For each `Property` node found, look up the referenced property in `propLookup` and copy its keyword values to the current property using `addValue`
- [ ] 1.3 Use the longhand keyword's original spec references (from its `helps` array) when calling `addValue`
- [ ] 1.4 Ensure the second pass runs before the CSS-wide keyword injection loop

## 2. Regenerate lexicon

- [ ] 2.1 Run the generator to regenerate `primitives.gen.ts` and `css.gen.ts`
- [ ] 2.2 Verify `textDecoration` now has `underline`, `overline`, `lineThrough`, `solid`, `double`, `dotted`, `dashed`, `wavy` keywords
- [ ] 2.3 Verify `overflow` now has `visible`, `hidden`, `clip`, `scroll`, `auto` keywords
- [ ] 2.4 Verify longhand keyword doc comments reference the longhand's spec (e.g., `css-text-decor-4`), not the shorthand's
- [ ] 2.5 Verify no duplicate keywords on properties that share keyword names with their longhands

## 3. Validate

- [ ] 3.1 Run existing tests to ensure nothing breaks
- [ ] 3.2 Build the lexicon package to verify generated types compile
- [ ] 3.3 Build the babel package to verify the primitive table still works
