## Why

Boolean HTML attributes like `checked`, `disabled`, `hidden`, and `autofocus` currently require the `attr()` escape hatch (`attr("checked", true)`). This is verbose and inconsistent with the rest of the DSL where HTML elements and CSS properties are bare globals. Promoting boolean attributes to first-class DSL symbols enables idiomatic markup like `input(checked)`.

## What Changes

- **Add 41 boolean HTML attributes as ambient global constants.** Each is a bare identifier of type `Attr` that compiles to `attr("name", true)`. Examples: `checked`, `disabled`, `hidden`, `autofocus`, `required`, `readonly`, `muted`, `autoplay`, `controls`, `loop`, `defer`, `inert`, `multiple`, `open`, `reversed`, `selected`, etc.
- **Handle one collision with JS keywords.** `async` becomes `async$` following the `$` suffix collision convention introduced by `css-value-helpers`. `default` is excluded entirely (JS reserved word, only applies to `<track>`, already a collision).
- **Bare-only semantics.** These are not callable. They represent the boolean attribute in its "present" state. Conditional usage follows the `&&` pattern: `isReady && checked` (the renderer already drops `false`).

## Capabilities

### New Capabilities
- `boolean-attribute-globals`: Discovery, generation, and babel transform for boolean HTML attributes as ambient global constants.

### Modified Capabilities
- `lexicon-html-gen`: HTML generation extended to emit boolean attribute global declarations alongside element declarations.
- `lexicon-primitives-gen`: Primitives generation extended to emit a `booleanAttrs` data export.
- `primitive-table`: Primitive table extended with a new `booleanAttr` kind.
- `babel-plugin`: Babel plugin handles new `booleanAttr` primitive kind (bare reference only, compiles to `attr(name, true)`).

## Impact

- **`@hypeup/generate`**: `discoverHtml.ts` — add boolean attribute discovery (or new `discoverBooleanAttrs.ts`). `generateHtml.ts` — emit `declare global` entries for boolean attrs. `generatePrimitives.ts` — emit `booleanAttrs` data array.
- **`@hypeup/lexicon`**: `html.gen.ts` — new global `const` declarations of type `Attr`. `primitives.gen.ts` — new `booleanAttrs` export.
- **`@hypeup/babel`**: `buildDslPrimitives.ts` — new `BooleanAttrPrimitive` type, registration from `booleanAttrs` data. `hypeupBabelPlugin.ts` — new `handleBooleanAttr()` replacing bare references with `attr(name, true)`.
- **Depends on `css-value-helpers`** for the `$` suffix collision convention (`async$`).
