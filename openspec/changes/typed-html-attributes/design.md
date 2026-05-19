## Context

The lexicon package currently generates global HTML element declarations and CSS property declarations, but HTML attribute objects are only typed as generic content. Users can write `{ href: "/" }` and `{ type: "password" }`, but TypeScript cannot autocomplete attribute names, validate HTML spelling, validate enumerated values, or surface useful attribute docs.

The runtime already treats plain objects in element contents as HTML attributes. This change primarily strengthens the generated type layer and fixes boolean attribute serialization so typed boolean attributes produce conforming HTML.

The repository also has an active `boolean-attribute-helpers` change. That change is sugar for bare boolean globals such as `input(checked)`. This change is independent: it makes object attributes typed and generated.

## Goals / Non-Goals

**Goals:**
- Generate per-tag HTML attribute object types from maintained data packages rather than manual maps.
- Use HTML attribute spelling in object keys (`readonly`, `maxlength`, `for`, `http-equiv`).
- Generate strict string unions for enumerated attributes when source data provides known values.
- Allow arbitrary strings for enumerated attributes whose data says unknown values are valid, such as `target`.
- Keep `attr()` and `elem()` as explicit escape hatches for dynamic/custom attributes and tags.
- Generate useful IDE JSDoc summaries for elements and attributes from available metadata.
- Render boolean object attributes and `Attr` values as presence-only HTML when the value is `true`.

**Non-Goals:**
- Do not hand-curate the HTML attribute database.
- Do not add new SVG child element globals. Type `svg(...)` only because it is already a generated global.
- Do not merge or depend on boolean attribute globals; that remains separate sugar.
- Do not introduce runtime validation of attributes or values.
- Do not change the `on(...)` DSL or exclude inline `on*` attributes from generated object attribute types.

## Decisions

### Generate Attributes From Existing Data Packages

Use `html-element-attributes` for allowed attributes by HTML element, `html-enumerated-attributes` for enumerated values and `allowUnknown`, `property-information` for attribute kind metadata, and `@mdn/browser-compat-data` for MDN/spec links and status flags. Continue using `@webref/elements` for element names/spec links and `@webref/css` for CSS property docs.

Alternative considered: use `@webref/idl` and derive reflected attributes from Web IDL. That is insufficient because it does not encode all content-attribute names or strict enumerated value sets in the form users write in markup.

Alternative considered: hand-curate attributes. That does not scale and would go stale quickly.

### Make `Content` A Real Union

Replace the ambient `Content = any` declaration with a generated union of known renderable node types, primitive child values, nested arrays, and per-tag attribute objects. Generated element globals use tag-specific content, while generic helpers such as `attr()` and `elem()` remain explicit escape hatches.

This is intentionally breaking. Existing consumers do not need compatibility shims.

### Keep HTML Attribute Spelling

Generated attribute object keys use HTML attribute spelling only. For example, users write `readonly`, `maxlength`, `for`, and `http-equiv`, not DOM property aliases like `readOnly`, `maxLength`, `htmlFor`, or `httpEquiv`.

This matches the serialized output and avoids teaching both DOM and HTML spellings in the DSL.

### Preserve Helpful Autocomplete For Loose Strings

For enumerated attributes with `allowUnknown`, generate a known-value union plus a loose string type:

```ts
type LooseString = string & {}
```

This permits arbitrary strings without fully erasing IDE suggestions for known values.

### Include Boolean Rendering Fix

When attribute classification sees `true` for an object attribute or `Attr`, it preserves presence semantics. The renderer emits the attribute name without `="true"`. Falsey object attribute values remain omitted by classification, so `{ disabled: false }` omits the attribute.

Booleanish/enumerated attributes such as `contenteditable` and `draggable` use string unions like `"true" | "false"` rather than boolean so values such as `"false"` still render.

## Risks / Trade-offs

- Generated types may be large → Keep generated helper aliases shared and avoid duplicating long unions where possible.
- Source packages may disagree on attribute names or coverage → Use `html-element-attributes` as the source of allowed names, then enrich with `property-information`, `html-enumerated-attributes`, and MDN data when available.
- Some deprecated attributes will appear because the source package includes them → Include generated JSDoc status from MDN when available so IDEs can show deprecation, but do not remove source-provided attrs in this change.
- Strict typing can reject intentionally custom attributes on standard tags → Use `attr()` as the opt-out for custom or experimental attributes.
- Boolean rendering changes output snapshots → Update tests to reflect conforming HTML output.

## Migration Plan

Regenerate lexicon output after generator changes. Update tests and README in the same change. Because this framework is experimental and existing consumers do not require compatibility, no runtime migration layer is needed.
