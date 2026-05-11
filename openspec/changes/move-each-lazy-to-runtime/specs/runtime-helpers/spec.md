## ADDED Requirements

### Requirement: each helper
The `each` function SHALL be exported from `@hypeup/runtime`. It SHALL have two overloads: a 3-argument form `each(items, keyFn, mapFn, context?)` that creates a keyed `Each` node, and a 2-argument form `each(items, mapFn)` that creates an index-keyed `Each` node.

#### Scenario: each with key function
- **WHEN** `each([a, b], item => item.id, item => li(item.name))` is called
- **THEN** the result SHALL be an `Each` node with the items, key function, and map function stored

#### Scenario: each with index keys
- **WHEN** `each([a, b], item => li(item.name))` is called
- **THEN** the result SHALL be an `Each` node with an auto-generated index key function

### Requirement: lazy helper
The `lazy` function SHALL be exported from `@hypeup/runtime`. It SHALL accept `(fn: Function, args: unknown[])` and return a `Lazy` vdom node.

#### Scenario: lazy creates Lazy node
- **WHEN** `lazy(MyComponent, [prop1, prop2])` is called
- **THEN** the result SHALL be a `Lazy` node with `fn: MyComponent` and `args: [prop1, prop2]`

### Requirement: Runtime exports Each and Lazy vdom types
`@hypeup/runtime` SHALL re-export `Each` and `Lazy` from `@hypeup/vdom` alongside the existing vdom type re-exports.

#### Scenario: Each and Lazy importable from runtime
- **WHEN** `@hypeup/runtime` is imported
- **THEN** `Each` and `Lazy` SHALL be available as named exports
