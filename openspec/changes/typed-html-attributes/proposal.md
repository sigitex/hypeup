## Why

HTML attributes currently use untyped object literals, so users get no attribute-name autocomplete, no value autocomplete, and no early feedback for misspelled attributes or invalid enumerated values. The lexicon already generates HTML and CSS DSL types, so generated attribute data is the natural next step for making markup authoring feel complete in TypeScript.

## What Changes

- Generate typed object-attribute support for HTML element globals from maintained data packages instead of hand-curating attribute maps.
- **BREAKING**: Replace the ambient `Content = any` model with a well-known union that includes generated per-tag attribute objects and known vdom/runtime/client node types.
- **BREAKING**: Type generated HTML element globals with tag-specific content, so attributes use HTML spelling (`readonly`, `maxlength`, `for`) and invalid DOM-property aliases (`readOnly`, `maxLength`, `htmlFor`) are rejected.
- Add strict string unions for enumerated attributes where source data provides allowed values, while preserving arbitrary strings for attributes whose data marks unknown values as valid (for example `target`).
- Allow boolean values for boolean HTML attributes in object attributes and render true boolean attributes as presence-only HTML.
- Generate IDE-facing JSDoc summaries for elements and attributes using available element, attribute, MDN, and spec metadata.
- Update `README.md` to document typed object attributes, value autocomplete, boolean attribute rendering, and escape hatches such as `attr()`/`elem()`.

## Capabilities

### New Capabilities
- `typed-html-attributes`: Generated per-tag HTML attribute object typing, value unions, generated docs, and typed element content.

### Modified Capabilities
- `lexicon-html-gen`: Generated HTML globals become tag-specific typed element builders/functions with generated attribute docs instead of untyped content-only declarations.
- `runtime-classifier`: Element classification preserves true boolean attribute values and omits false boolean object attributes correctly.
- `server-render`: HTML rendering emits true boolean attributes as presence-only attributes.
- `vdom-nodes`: Element builder/content typing becomes generic enough to carry tag-specific generated content types.

## Impact

- **`@hypeup/generate`**: Adds attribute discovery/generation backed by `html-element-attributes`, `html-enumerated-attributes`, `property-information`, and `@mdn/browser-compat-data`.
- **`@hypeup/lexicon`**: Regenerated `html.gen.ts` declares typed content and attribute maps with generated JSDoc; generated files remain produced via `bun run generate` from `packages/lexicon`.
- **`@hypeup/vdom` / `@hypeup/runtime`**: Type declarations and classifier output may change to represent true boolean attributes.
- **`@hypeup/render`**: Boolean attributes render in conforming presence-only form.
- **Docs/tests**: README and type/runtime tests cover typed attributes, escape hatches, generated value unions, boolean rendering, and invalid aliases.
