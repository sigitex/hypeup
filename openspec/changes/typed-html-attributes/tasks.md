## 1. Attribute Data Discovery

- [x] 1.1 Add generator dependencies for `html-element-attributes`, `html-enumerated-attributes`, `property-information`, and `@mdn/browser-compat-data` in `packages/generate/package.json`
- [x] 1.2 Add type declarations or import handling needed for the new data packages
- [x] 1.3 Create `packages/generate/src/discoverHtmlAttributes.ts` to load per-element attributes, global attributes, enumerated values, attribute metadata, and MDN/spec docs
- [x] 1.4 Normalize attribute names to serialized HTML spelling and preserve tag-specific applicability from `html-element-attributes`
- [x] 1.5 Map attribute metadata to generator value kinds: boolean, numeric, enumerated, loose enumerated, token/string, and generic attribute values

## 2. Generated Type Surface

- [x] 2.1 Update `packages/vdom/src/ElementBuilder.ts` so `ElementBuilder` is a generic type-only callable builder specialized by content type
- [x] 2.2 Update runtime type exports so generated lexicon files can import `ElementBuilder` and known node types from `@hypeup/runtime`
- [x] 2.3 Update `packages/generate/src/generateHtml.ts` to emit `AttributeMap`, global attribute types, reusable value aliases, and tag-specific `Content<Tag>` typing
- [x] 2.4 Generate element globals with tag-specific content types for standard, void, and keyword-collision elements
- [x] 2.5 Generate JSDoc summaries for elements and attributes, including known values and MDN/spec/status metadata when available
- [x] 2.6 Regenerate lexicon files by running `bun run generate` in `packages/lexicon`

## 3. Runtime Boolean Attribute Semantics

- [x] 3.1 Update `packages/runtime/src/classify.ts` so true `Attr` values and true object attributes are preserved as presence attributes
- [x] 3.2 Ensure false, null, undefined, and empty string object attribute values continue to be omitted by classification
- [x] 3.3 Update `packages/render/src/render.ts` so classified attributes with value `true` render as presence-only HTML without `="true"`
- [x] 3.4 Add or update runtime/render tests for true boolean object attrs, false boolean object attrs, true `Attr` values, and textual false enumerated attrs

## 4. Type Coverage

- [x] 4.1 Add lexicon type tests that accept global attributes such as `id` and `class` on standard elements
- [x] 4.2 Add lexicon type tests that accept tag-specific attributes such as `input({ placeholder: "Email" })` and reject invalid tag-specific attributes such as `div({ placeholder: "Email" })`
- [x] 4.3 Add lexicon type tests that accept HTML spelling (`readonly`, `maxlength`) and reject DOM aliases (`readOnly`, `maxLength`)
- [x] 4.4 Add lexicon type tests that accept valid enumerated values and reject invalid strict enumerated values such as invalid `input.type`
- [x] 4.5 Add lexicon type tests that allow arbitrary strings for loose enumerated values such as `a({ target: "preview-window" })`
- [x] 4.6 Add lexicon type tests for boolean attributes, booleanish string attributes, and `attr()`/`elem()` escape hatches

## 5. Documentation

- [x] 5.1 Update `README.md` Markup docs to describe typed object attributes, HTML attribute spelling, value autocomplete, and boolean attribute rendering
- [x] 5.2 Document `attr()` and `elem()` as escape hatches for custom or dynamic attributes and tags
- [x] 5.3 Mention that boolean attribute globals are separate sugar and not required for typed object attributes

## 6. Verification

- [x] 6.1 Run `bun run check` in `packages/generate`
- [x] 6.2 Run `bun run check` in `packages/vdom`
- [x] 6.3 Run `bun run check` in `packages/runtime`
- [x] 6.4 Run `bun run check` in `packages/render`
- [x] 6.5 Run `bun run check` in `packages/lexicon`
- [x] 6.6 Run relevant package tests for lexicon, runtime, and render
- [x] 6.7 Run root `bun run check` and root `bun run test` if focused package checks pass
