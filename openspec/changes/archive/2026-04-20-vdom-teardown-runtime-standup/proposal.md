## Why

The vdom node classes (`Element`, `Rule`, `AtRule`) eagerly classify their contents at construction time via `add()` methods, sorting inputs into pre-sorted fields (`attributes`, `properties`, `classes`, `children`). This couples the node representation to the walk/emit logic, blocks the planned build transform (which needs dumb data containers the transformer can construct with a single call), and prevents the FE runtime from handling signals (which must stay opaque in `contents` until mount-time). A separate `@hypeup/runtime` package is needed to own the classification logic, helper functions, and the `cssesc` dependency.

## What Changes

- **Simplify vdom node classes**: `Element`, `Rule`, `AtRule` store raw `contents` only. Remove `add()` methods and pre-sorted fields (`attributes`, `properties`, `classes`, `children`, `rules`). Delete `ElementBuilder`.
- **Delete `factories/` directory**: Proxy-backed factories (`element`, `rule`, `atRule`, `property`, `propertyValue`) are superseded by the build transform. Remove all Proxy usage.
- **Flatten `nodes/` to `src/`**: Collapse `vdom/src/nodes/` up one level.
- **Add new node types**: `CssClass` (first-class class contribution) and `Attr` (HTML attribute node).
- **Create `@hypeup/runtime` package**: Houses helper functions (`elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `atRule`, `className`, `cssString`), classifier functions (`classifyElement`, `classifyRule`, `classifyAtRule`), and owns the `cssesc` dependency.
- **Update `@hypeup/render`**: Replace direct field reads on nodes with calls to the shared classifier from `@hypeup/runtime`.
- **Add test suite**: Covering vdom constructors, classifier output, and rendered HTML/CSS for a fixture set.

## Capabilities

### New Capabilities
- `runtime-helpers`: Helper functions (`elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `atRule`, `className`, `cssString`) that construct vdom nodes, exported from `@hypeup/runtime`.
- `runtime-classifier`: Classifier functions (`classifyElement`, `classifyRule`, `classifyAtRule`) that walk raw `contents` arrays and produce sorted slot objects, exported from `@hypeup/runtime`.
- `vdom-nodes`: Simplified vdom node classes (`Element`, `Rule`, `AtRule`, `Property`, `Raw`, `CssClass`, `Attr`) that store raw contents without classification.

### Modified Capabilities

## Impact

- **`@hypeup/vdom`**: Breaking internal restructure. All pre-sorted fields removed, `factories/` deleted, `nodes/` flattened. Public exports change (no more `ElementBuilder`, factory functions).
- **`@hypeup/render`**: Must update to use classifier. No change to HTML/CSS output.
- **`@hypeup/runtime`**: New workspace package. Depends on `@hypeup/vdom` and `cssesc`.
- **`@hypeup/render` dependency**: Gains `@hypeup/runtime` dependency (for classifier).
- **Downstream**: `@hypeup/lexicon` and future `@hypeup/babel` will import from `@hypeup/runtime` instead of `@hypeup/vdom` for helpers.
