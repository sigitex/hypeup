## Context

The `ref` function creates a `Ref<T>` object used to capture a DOM handle during mounting. Currently, users parameterize it with DOM interface types like `HTMLInputElement`. The hypeup DSL otherwise operates entirely in tag-name space -- users write `input(...)`, not `HTMLInputElement(...)`. The ref API should match.

TypeScript's built-in `HTMLElementTagNameMap` and `SVGElementTagNameMap` interfaces map tag name strings to their corresponding DOM element types, making this a type-level-only change with no runtime impact.

## Goals / Non-Goals

**Goals:**
- Replace the element-type generic parameter on `ref` with a tag-name string generic parameter
- Support both HTML and SVG tag names
- Keep `ref()` (no parameter) working as an untyped/general ref
- Minimal change surface -- type-level only, no runtime behavior change

**Non-Goals:**
- MathML support (can be added later by extending the tag union)
- Custom element support beyond what `HTMLElementTagNameMap` augmentation already provides
- Changing the `Ref` class API (it remains a simple `{ current: T | null }` container)

## Decisions

### Decision: Single generic with conditional type resolution

Use one generic parameter `K extends AllTags` with a conditional type `ResolveTag<K>` to map tag names to element types.

```ts
type AllTags = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap

type ResolveTag<K extends AllTags> =
  K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] :
  K extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[K] :
  never

function ref<K extends AllTags = AllTags>(): Ref<ResolveTag<K>>
```

**Alternative considered: Overloads.** One overload for tag strings, one for element types, one for bare `ref()`. Rejected -- adds complexity for backward compatibility we don't need.

**Alternative considered: Separate HTML/SVG functions.** E.g., `ref<"input">()` vs `svgRef<"path">()`. Rejected -- unnecessary split; the tag name maps don't conflict in practice (overlapping tags like `"a"` resolve to HTML first, which is the expected default).

### Decision: HTML takes precedence for overlapping tags

Tags like `"a"` and `"title"` exist in both `HTMLElementTagNameMap` and `SVGElementTagNameMap`. The conditional checks HTML first, so `ref<"a">()` gives `HTMLAnchorElement`. This matches the DSL's primary use case. SVG-specific `"a"` refs are an extreme edge case.

### Decision: Default to full union for bare `ref()`

`ref()` with no type parameter defaults `K` to `AllTags`, which distributes to the union of all element types. This is correct -- an untyped ref shouldn't give access to specific element properties without narrowing.

### Decision: Widen `Ref<T>` constraint to `Element`

The `Ref` class currently constrains `T extends HTMLElement`. To support SVG types (which extend `SVGElement extends Element`, not `HTMLElement`), widen to `T extends Element`. This is the minimal widening needed.

### Decision: Types live alongside the `ref` function

`AllTags` and `ResolveTag` are defined in `packages/client/src/ref.ts` next to the function that uses them, and duplicated in the global declare in `packages/lexicon/src/primitives.ts`. They could be extracted to a shared types file, but for two small type aliases that's unnecessary indirection.

## Risks / Trade-offs

- **[Tooltip verbosity]** Bare `ref()` shows a large union type in IDE tooltips. → Accepted; user explicitly chose simplicity over tooltip aesthetics.
- **[Overlapping tag names]** `ref<"a">()` resolves to HTML, not SVG. → Acceptable; SVG anchor refs are vanishingly rare. Users can augment the type maps if needed.
- **[Breaking change]** Existing `ref<HTMLInputElement>()` calls won't compile. → Intentional; only one known usage site (TodoMVC example). Search-and-replace fix.
