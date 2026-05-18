## ADDED Requirements

### Requirement: hydrate() adopts server-rendered DOM and returns a redraw handle
`hydrate(root, componentFn)` SHALL accept a root DOM element and a component function. It SHALL invoke the component function to produce a vdom tree, walk the existing server-rendered DOM inside `root` to build `MountHandle` state (the same structure produced by `mountElement`), and return an `AppHandle` with `redraw()` and `dispose()` methods. After hydration, `redraw()` SHALL use the standard `diffElement` path to patch the DOM.

#### Scenario: Hydrate server-rendered content
- **WHEN** `hydrate(root, () => div("hello"))` is called and `root` contains a server-rendered `<div>hello</div>`
- **THEN** the existing DOM SHALL be adopted (not replaced)
- **AND** the returned handle SHALL have `redraw()` and `dispose()` methods

#### Scenario: Redraw after hydration
- **WHEN** state changes and `handle.redraw()` is called after hydration
- **THEN** the component function SHALL be re-invoked and the DOM SHALL be patched via the standard slot diffing path

#### Scenario: Dispose after hydration
- **WHEN** `handle.dispose()` is called on a hydrated root
- **THEN** event listeners SHALL be removed, the DOM SHALL be removed from the root, and subsequent `redraw()` calls SHALL be no-ops

### Requirement: hydrateElement builds MountHandle from existing DOM
`hydrateElement(existing, node, context)` SHALL walk an existing DOM element and its vdom counterpart, classifying each vdom content arg and building a `SlotRecord[]` that matches what `mountElement` would have produced. Attributes, classes, and styles SHALL be verified against existing DOM. Event listeners and refs SHALL be attached. Child elements SHALL be matched by tag name using a child cursor.

#### Scenario: Attributes verified during hydration
- **WHEN** hydrating an element whose vdom specifies `attr("href", "/about")`
- **THEN** the existing DOM attribute SHALL be verified and an `attribute` SlotRecord SHALL be recorded

#### Scenario: Event listeners attached during hydration
- **WHEN** hydrating an element whose vdom includes `on("click", handler)`
- **THEN** an event listener SHALL be attached to the existing DOM element using the owning root's scoped redraw
- **AND** an `event` SlotRecord SHALL be recorded

#### Scenario: Refs assigned during hydration
- **WHEN** hydrating an element whose vdom includes a `ref()`
- **THEN** `ref.current` SHALL be set to the existing DOM element

#### Scenario: Child elements hydrated recursively
- **WHEN** hydrating a `div` with child `span("text")`
- **THEN** the existing `<span>` child SHALL be matched by tag name and hydrated recursively

#### Scenario: Text nodes adopted during hydration
- **WHEN** hydrating an element with text content `"hello"`
- **THEN** the existing text node SHALL be captured into a `text` SlotRecord

### Requirement: Hydration mismatch triggers fallback mount
When `hydrateElement` encounters a DOM mismatch (wrong tag name, missing child node), it SHALL fall back to removing the mismatched subtree and mounting fresh via `mountElement`.

#### Scenario: Tag mismatch falls back to mount
- **WHEN** hydrating a vdom `span("text")` but the existing child is a `<div>`
- **THEN** the `<div>` SHALL be removed and a new `<span>` SHALL be mounted in its place

#### Scenario: Missing child falls back to mount
- **WHEN** hydrating a vdom tree that expects 3 children but the existing DOM has only 2
- **THEN** the third child SHALL be mounted fresh and appended

### Requirement: Each nodes hydrated by iterating existing children
When `hydrateElement` encounters an `Each` vdom node, it SHALL iterate the items array, match each keyed child against existing DOM children by position, and build `EachState` with `MountHandle` entries for each child. The keyed reconciler is NOT used during initial hydration — only during subsequent diffs.

#### Scenario: Each node hydrated from server-rendered list
- **WHEN** hydrating `ul(each(items, i => i.id, i => li(i.name)))` and the DOM contains the matching `<li>` elements
- **THEN** each `<li>` SHALL be adopted and an `EachState` SHALL be built for future reconciliation

### Requirement: Lazy nodes hydrated by calling function and adopting DOM
When `hydrateElement` encounters a `Lazy` vdom node, it SHALL call `lazy.fn(...args)` to resolve the vdom, then hydrate the result against the existing DOM child. The `SlotRecord` SHALL store the function, args, and hydrated `MountHandle` for future lazy-skip comparisons.

#### Scenario: Lazy node hydrated
- **WHEN** hydrating a `Lazy` node whose function produces `div("content")`
- **THEN** the existing `<div>content</div>` SHALL be adopted and a `lazy` SlotRecord SHALL be recorded with the function and args
