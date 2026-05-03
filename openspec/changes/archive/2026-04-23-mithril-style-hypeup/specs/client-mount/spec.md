## MODIFIED Requirements

### Requirement: mount accepts a component function and returns a redraw handle
`mount(root, componentFn)` SHALL accept a root DOM element and a component function. It SHALL invoke the component function, mount the resulting vdom into the root element, record the slot state for diffing, and return a handle with `redraw()` and `dispose()` methods.

#### Scenario: Initial mount
- **WHEN** `mount(root, () => div("hello"))` is called
- **THEN** a `<div>` with text `"hello"` SHALL be appended to `root`
- **AND** the returned handle SHALL have `redraw()` and `dispose()` methods

#### Scenario: Redraw via handle
- **WHEN** `handle.redraw()` is called after state changes
- **THEN** the component function SHALL be re-invoked and the DOM SHALL be patched via slot diffing

#### Scenario: Dispose removes DOM and cleans up
- **WHEN** `handle.dispose()` is called
- **THEN** the mounted DOM SHALL be removed from the root element
- **AND** subsequent `redraw()` calls SHALL be no-ops

### Requirement: mount no longer wraps args in effects
`mountElement` SHALL process args statically -- classifying and applying each one without creating effects or tracking contexts. Functions passed as args that are NOT event handlers SHALL be called once and their return value classified and applied.

#### Scenario: Static args applied without effects
- **WHEN** `mountElement(elem("div", [className("foo"), "text"]))` is called
- **THEN** the class and text SHALL be applied directly with no effect wrapping
