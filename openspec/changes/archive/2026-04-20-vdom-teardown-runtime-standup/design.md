## Context

`@hypeup/vdom` currently has node classes (`Element`, `Rule`, `AtRule`) that eagerly classify their contents at construction via `add()` methods, sorting inputs into pre-sorted fields. The `factories/` directory provides Proxy-backed constructors. The `render` package reads these pre-sorted fields directly.

This design was built for a runtime-global model where DSL references resolve at execution time. The planned build transform model replaces that: all DSL references lower to helper calls at compile time, and classification defers to walk time. The current eager-classify + Proxy-factory architecture must be replaced.

Current structure:
- `vdom/src/nodes/` — `Element` (with `add()`, pre-sorted fields), `Rule` (with `add()`, `properties`/`rules`), `AtRule` (with `add()`, `properties`/`contents`), `Property`, `Raw`, `ElementBuilder`
- `vdom/src/factories/` — Proxy-backed `element`, `atRule`, `property`, `propertyValue`
- `render/src/render.ts` — reads `element.attributes`, `element.properties`, `element.children`, `rule.properties`, `rule.rules`, `atRule.properties`, `atRule.contents`

No `@hypeup/runtime` package exists yet. No test suite exists.

## Goals / Non-Goals

**Goals:**
- Simplify vdom nodes to dumb data containers storing raw `contents`
- Create `@hypeup/runtime` as a new workspace package with helpers and classifiers
- Update `@hypeup/render` to use the classifier instead of pre-sorted fields
- Add `CssClass` and `Attr` node types
- Establish a test baseline (no existing tests to preserve)
- Maintain identical HTML/CSS output from the renderer

**Non-Goals:**
- CLI or MCP transports
- Build transform / Babel plugin (Phase 4)
- FE runtime / signals / `mount.ts` (Phase 6)
- Generator changes / `primitives.gen.ts` (Phase 2)
- `@hypeup/lexicon` restructure (Phase 3)
- Dev-mode warnings for invalid content placement
- `cssesc` implementation details beyond "runtime owns the dep"

## Decisions

### 1. `@hypeup/runtime` is a separate workspace package (not folded into vdom)

Vdom stays focused on node class definitions. Runtime owns helpers, classifiers, and `cssesc`. This keeps the vdom package dependency-free and suitable for import by any tier.

Alternative: fold everything into vdom. Rejected because it couples the node representation to the walk logic, and the `cssesc` dependency would leak into every consumer.

### 2. Classifier functions, not methods

Classification moves from `Element.add()`/`Rule.add()`/`AtRule.add()` instance methods to standalone functions in `@hypeup/runtime`: `classifyElement(contents, isVoid)`, `classifyRule(contents)`, `classifyAtRule(contents)`. Called at walk time by render (server) and mount (client).

Alternative: keep classification as a method on each node. Rejected because the client needs different classification behavior (signal-awareness) and methods would force subclassing or monkey-patching.

### 3. Node classes store only raw `contents`

`Element` keeps `tag`, `isVoid`, `contents`. No `attributes`, `properties`, `classes`, `children` fields. `Rule` keeps `selector`, `contents`. No `properties`, `rules` fields. `AtRule` keeps `keyword`, `rule`, `contents`. No `properties` field. Classification is purely derived at walk time.

### 4. `CssClass` and `Attr` as first-class nodes

`CssClass` has a single `name: string` field. `Attr` has `name: string` and `value: Content`. Both participate in the `contents` array and are routed by the classifier. This closes the asymmetry where `Property` could propagate but classes and attributes could not.

### 5. Delete `ElementBuilder` and all factories

`ElementBuilder` type and all `factories/` code are removed. No Proxy usage remains. The build transform handles all DSL ergonomics at compile time.

### 6. Flatten `nodes/` to `src/`

`vdom/src/nodes/*.ts` moves up to `vdom/src/*.ts`. The `nodes/` subdirectory is no longer justified after `factories/` is deleted.

### 7. Render update is mechanical

`render.ts` replaces field reads (`x.attributes`, `x.properties`, `x.children`, `rule.properties`, `rule.rules`, `atRule.properties`) with classifier calls. HTML/CSS output is identical. `render` gains a dependency on `@hypeup/runtime`.

### 8. `classifyElement` receives `isVoid` flag

When `isVoid` is true, the classifier never pushes into `slots.children`. Attributes, properties, and classes still flow normally. This preserves the uniform arg-list shape for void elements.

## Risks / Trade-offs

- **[Risk] Render output drift** -- Since there's no existing test suite, changes to render behavior may go unnoticed. Mitigation: the fixture test suite established in this phase becomes the baseline.
- **[Risk] `Rule` constructor no longer accepts `ElementBuilder`** -- Current `Rule` accepts `string | ElementBuilder` as selector. After deleting `ElementBuilder`, it accepts only `string`. Mitigation: the build transform will substitute element identifiers with tag strings at compile time; no runtime path needs `ElementBuilder`.
- **[Trade-off] Classification cost moves from construction to walk** -- Each render pass now classifies on the fly. Acceptable because render is already O(n) over the tree, and classification is a single pass over `contents` with no allocation beyond the slots object.
- **[Trade-off] `{class: "..."}` splitting happens at classify time** -- Class attribute objects are split into individual class entries by the classifier, not at construction. This is correct behavior but means the raw `contents` array may contain mixed representations of classes (both `CssClass` nodes and `{class: "..."}` objects).
