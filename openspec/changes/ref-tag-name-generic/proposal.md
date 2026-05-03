## Why

The `ref` function currently requires DOM interface names as its generic parameter (e.g., `ref<HTMLInputElement>()`). This is inconsistent with the rest of the hypeup DSL, which is built entirely around tag names (`input(...)`, `div(...)`, `svg(...)`). Users shouldn't need to know `HTMLInputElement` when they already think in terms of `"input"`. Using tag name strings as the generic parameter (`ref<"input">()`) aligns ref with the DSL vocabulary and is more concise.

## What Changes

- **BREAKING**: The `ref` function generic parameter changes from an element type (`HTMLInputElement`) to a tag name string literal (`"input"`). Old usage like `ref<HTMLInputElement>()` will no longer compile.
- The `Ref` class constraint widens from `T extends HTMLElement` to `T extends Element` to support both HTML and SVG element types.
- The `ref` function signature uses `HTMLElementTagNameMap` and `SVGElementTagNameMap` to resolve tag name strings to their corresponding DOM types.
- The global `declare` for `ref` in the lexicon primitives is updated to match.
- Existing usage in examples is updated (`ref<HTMLInputElement>()` becomes `ref<"input">()`).

## Capabilities

### New Capabilities

- `ref-tag-generic`: Type-level mapping from HTML/SVG tag name strings to DOM element types for the `ref` function generic parameter.

### Modified Capabilities

- `vdom-nodes`: The `Ref` class constraint widens from `T extends HTMLElement` to `T extends Element`.
- `lexicon-primitives`: The global `ref` declaration changes its generic parameter from an element type to a tag name string.

## Impact

- `packages/vdom/src/Ref.ts` -- widen generic constraint
- `packages/client/src/ref.ts` -- new type aliases and updated function signature
- `packages/lexicon/src/primitives.ts` -- updated global `ref` declaration
- `examples/todomvc/src/TodoItem.ts` -- update usage
- `packages/client/src/mount.test.ts` -- update test usage if typed
