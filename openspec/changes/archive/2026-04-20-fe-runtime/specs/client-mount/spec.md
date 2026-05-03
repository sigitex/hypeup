## ADDED Requirements

### Requirement: mount creates real DOM from DSL tree
`mount(node)` SHALL accept a DSL `Element` node and return a real DOM `HTMLElement`. It SHALL recursively walk the node's `contents`, classify each argument, and apply it to the created DOM element.

#### Scenario: Simple element with text child
- **WHEN** `mount(elem("div", ["hello"]))` is called
- **THEN** it SHALL return a `<div>` HTMLElement with a text child node containing "hello"

#### Scenario: Nested elements
- **WHEN** `mount(elem("div", [elem("span", ["inner"])]))` is called
- **THEN** it SHALL return a `<div>` containing a `<span>` containing "inner"

#### Scenario: Element with mixed argument types
- **WHEN** `mount(elem("div", [new CssClass("active"), new Property("color", "red"), "text"]))` is called
- **THEN** the returned `<div>` SHALL have class "active", style "color: red", and text child "text"

### Requirement: mount handles void elements
`mount()` SHALL create void elements correctly. Void elements SHALL NOT have child content appended.

#### Scenario: Void element creation
- **WHEN** `mount(elem("br", []))` is called with `isVoid: true`
- **THEN** it SHALL return a `<br>` HTMLElement with no children

### Requirement: mount returns disposer for cleanup
`mount()` SHALL track all signal subscriptions created during the mount. It SHALL provide a mechanism to dispose all subscriptions when the mounted element is removed from the DOM.

#### Scenario: Subscriptions disposed on cleanup
- **WHEN** a mounted element with reactive bindings is disposed
- **THEN** all signal subscriptions created during that mount SHALL be unsubscribed

### Requirement: mount handles reactive arguments
When a signal is encountered during mount, `mount()` SHALL subscribe to it, apply the current value, and re-apply on change using the undo/redo model.

#### Scenario: Signal text child updates
- **WHEN** `mount(elem("div", [signal("hello")]))` is called and the signal later changes to "world"
- **THEN** the text child SHALL update from "hello" to "world"

#### Scenario: Signal class updates
- **WHEN** a signal containing `new CssClass("active")` changes to `new CssClass("inactive")`
- **THEN** "active" SHALL be removed from classList and "inactive" SHALL be added
