## ADDED Requirements

### Requirement: Classification dispatches by instanceof
The client classifier SHALL use `instanceof` checks against vdom node classes to determine argument kind: `Element`, `Property`, `Attr`, `CssClass`, `Raw`, plus type checks for string, plain object, array, and signal.

#### Scenario: Element classified as child
- **WHEN** an `Element` instance is classified
- **THEN** it SHALL be treated as a child element and recursively mounted

#### Scenario: Property classified as style
- **WHEN** a `Property` instance is classified
- **THEN** it SHALL be applied via `element.style.setProperty(name, value)`

#### Scenario: Attr classified as attribute
- **WHEN** an `Attr` instance is classified
- **THEN** it SHALL be applied via `element.setAttribute(name, value)`

#### Scenario: CssClass classified as class
- **WHEN** a `CssClass` instance is classified
- **THEN** it SHALL be applied via `element.classList.add(name)`

#### Scenario: Raw classified as unescaped content
- **WHEN** a `Raw` instance is classified
- **THEN** its content SHALL be inserted as unescaped HTML

#### Scenario: String classified as text child
- **WHEN** a string value is classified
- **THEN** it SHALL be appended as a `Text` node

#### Scenario: Plain object classified as attributes map
- **WHEN** a plain object `{ id: "main", hidden: true }` is classified
- **THEN** each key-value pair SHALL be applied via `setAttribute`

#### Scenario: Array flattened and recursed
- **WHEN** an array of arguments is classified
- **THEN** each item SHALL be individually classified and applied

### Requirement: Undo closure recorded per application
Every `apply` operation SHALL return (or record) an `undo` closure that reverses exactly what was applied. This enables the undo/redo reactive update model.

#### Scenario: Style undo
- **WHEN** a Property is applied setting `color: red`, then undone
- **THEN** the `color` style property SHALL be removed

#### Scenario: Class undo
- **WHEN** a CssClass "active" is applied, then undone
- **THEN** "active" SHALL be removed from `classList`

#### Scenario: Child undo
- **WHEN** an Element child is mounted and appended, then undone
- **THEN** the child DOM node SHALL be removed from the parent

#### Scenario: Attribute undo
- **WHEN** an attribute is set, then undone
- **THEN** the attribute SHALL be removed via `removeAttribute`

### Requirement: Signal arguments trigger subscribe and undo/redo
When a signal is encountered during classification, the runtime SHALL read its current value, classify and apply it, record the undo, and subscribe. On change: call undo, classify new value, apply, record new undo.

#### Scenario: Signal kind-switch
- **WHEN** a signal initially holds a string "hello" (text child) and changes to `new CssClass("active")`
- **THEN** the text child SHALL be removed and "active" SHALL be added to classList
