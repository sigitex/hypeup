## ADDED Requirements

### Requirement: on.create returns an OnCreate vdom node
`on.create(callback)` SHALL accept a callback function `(el: HTMLElement) => void` and return an `OnCreate` vdom node. This is a namespace extension on the existing `on` function.

#### Scenario: on.create returns OnCreate
- **WHEN** `on.create((el) => init(el))` is called
- **THEN** the result SHALL be an `OnCreate` instance with the provided callback

### Requirement: on.remove returns an OnRemove vdom node
`on.remove(callback)` SHALL accept a callback function `(el: HTMLElement) => void` and return an `OnRemove` vdom node. This is a namespace extension on the existing `on` function.

#### Scenario: on.remove returns OnRemove
- **WHEN** `on.remove((el) => cleanup(el))` is called
- **THEN** the result SHALL be an `OnRemove` instance with the provided callback
