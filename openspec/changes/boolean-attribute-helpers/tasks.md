## 1. Discovery and data generation

- [ ] 1.1 Add the hardcoded boolean attributes list (41 entries) and collision handling (`async` → `async$`, `default` excluded) to `packages/generate/src/discoverHtml.ts`, exporting a `BooleanAttrSpec` type and discovery function
- [ ] 1.2 Update `packages/generate/src/generatePrimitives.ts` to accept boolean attrs and emit a `booleanAttrs` export (object mapping JS name → HTML attr name) in `primitives.gen.ts`
- [ ] 1.3 Update `packages/generate/src/generateHtml.ts` to emit `const <jsName>: Attr` declarations with doc comments for each boolean attribute inside the `declare global` block, and add `Attr` to the import from `@hypeup/runtime`
- [ ] 1.4 Update `packages/generate/src/generate.ts` to wire boolean attr discovery into the generation pipeline

## 2. Regenerate lexicon

- [ ] 2.1 Run `bun run generate` in `packages/lexicon` and verify `primitives.gen.ts` contains the `booleanAttrs` export with 41 entries
- [ ] 2.2 Verify `html.gen.ts` contains boolean attribute `const` declarations with `Attr` type and doc comments

## 3. Babel plugin

- [ ] 3.1 Add `BooleanAttrPrimitive` type (`{ kind: "booleanAttr"; attrName: string }`) to `packages/babel/src/buildDslPrimitives.ts` and register entries from `booleanAttrs` import
- [ ] 3.2 Add `handleBooleanAttr()` to `packages/babel/src/hypeupBabelPlugin.ts` — replace bare references with `attr(attrName, true)` call expression, skip call/member positions
- [ ] 3.3 Wire `booleanAttr` case into `handlePrimitive()` switch

## 4. Validate

- [ ] 4.1 Type-check lexicon package (`bun run check` in `packages/lexicon`)
- [ ] 4.2 Type-check babel package (`bun run check` in `packages/babel`)
- [ ] 4.3 Verify `checked`, `disabled`, `async$` appear in the primitive table by inspecting `buildDslPrimitives()` output
- [ ] 4.4 Run existing tests to confirm no regressions

## 5. Documentation

- [ ] 5.1 Add a "Boolean Attributes" subsection to `README.md` under Markup, documenting that standard boolean HTML attributes (`checked`, `disabled`, `hidden`, `readonly`, etc.) are available as bare globals — e.g. `input(checked)` instead of `attr("checked", true)`
- [ ] 5.2 Document the `$` suffix for collisions (`async$`) in that section
