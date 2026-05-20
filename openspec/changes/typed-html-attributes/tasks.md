## 1. Attribute Data Discovery

- [x] 1.1 Add generator dependencies for `html-element-attributes`, `html-enumerated-attributes`, `property-information`, and `@mdn/browser-compat-data` in `packages/generate/package.json`
- [x] 1.2 Add type declarations or import handling needed for the new data packages
- [x] 1.3 Create `packages/generate/src/discoverHtmlAttributes.ts` to load per-element attributes, global attributes, enumerated values, attribute metadata, and MDN/spec docs
- [x] 1.4 Normalize attribute names to serialized HTML spelling and preserve tag-specific applicability from `html-element-attributes`
- [x] 1.5 Map attribute metadata to generator value kinds: boolean, numeric, enumerated, loose enumerated, token/string, and generic attribute values

## 2. Generated Type Surface

- [ ] 2.1 Update `packages/vdom/src/ElementBuilder.ts` so `ElementBuilder` is a generic type-only callable builder specialized by content type
- [ ] 2.2 Update runtime type exports so generated lexicon files can import `ElementBuilder` and known node types from `@hypeup/runtime`
- [ ] 2.3 Update `packages/generate/src/generateHtml.ts` to emit `AttributeMap`, global attribute types, reusable value aliases, and tag-specific `Content<Tag>` typing
- [ ] 2.4 Generate element globals with tag-specific content types for standard, void, and keyword-collision elements
- [ ] 2.5 Generate JSDoc summaries for elements and attributes, including known values and MDN/spec/status metadata when available
- [ ] 2.6 Regenerate lexicon files by running `bun run generate` in `packages/lexicon`

## 3. Runtime Boolean Attribute Semantics

- [ ] 3.1 Update `packages/runtime/src/classify.ts` so true `Attr` values and true object attributes are preserved as presence attributes
- [ ] 3.2 Ensure false, null, undefined, and empty string object attribute values continue to be omitted by classification
- [ ] 3.3 Update `packages/render/src/render.ts` so classified attributes with value `true` render as presence-only HTML without `="true"`
- [ ] 3.4 Add or update runtime/render tests for true boolean object attrs, false boolean object attrs, true `Attr` values, and textual false enumerated attrs

## 4. Type Coverage

- [ ] 4.1 Add lexicon type tests that accept global attributes such as `id` and `class` on standard elements
- [ ] 4.2 Add lexicon type tests that accept tag-specific attributes such as `input({ placeholder: "Email" })` and reject invalid tag-specific attributes such as `div({ placeholder: "Email" })`
- [ ] 4.3 Add lexicon type tests that accept HTML spelling (`readonly`, `maxlength`) and reject DOM aliases (`readOnly`, `maxLength`)
- [ ] 4.4 Add lexicon type tests that accept valid enumerated values and reject invalid strict enumerated values such as invalid `input.type`
- [ ] 4.5 Add lexicon type tests that allow arbitrary strings for loose enumerated values such as `a({ target: "preview-window" })`
- [ ] 4.6 Add lexicon type tests for boolean attributes, booleanish string attributes, and `attr()`/`elem()` escape hatches

## 5. Documentation

- [ ] 5.1 Update `README.md` Markup docs to describe typed object attributes, HTML attribute spelling, value autocomplete, and boolean attribute rendering
- [ ] 5.2 Document `attr()` and `elem()` as escape hatches for custom or dynamic attributes and tags
- [ ] 5.3 Mention that boolean attribute globals are separate sugar and not required for typed object attributes

## 6. Verification

- [ ] 6.1 Run `bun run check` in `packages/generate`
- [ ] 6.2 Run `bun run check` in `packages/vdom`
- [ ] 6.3 Run `bun run check` in `packages/runtime`
- [ ] 6.4 Run `bun run check` in `packages/render`
- [ ] 6.5 Run `bun run check` in `packages/lexicon`
- [ ] 6.6 Run relevant package tests for lexicon, runtime, and render
- [ ] 6.7 Run root `bun run check` and root `bun run test` if focused package checks pass
