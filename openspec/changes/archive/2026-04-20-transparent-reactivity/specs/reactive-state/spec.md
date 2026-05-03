## ADDED Requirements

### Requirement: reactive creates a deeply proxied state object
`reactive(obj)` SHALL accept a plain object and return a deeply proxied version of the same shape. The returned object SHALL behave identically to the input for reads and writes, but property access SHALL be tracked when inside an effect context, and property assignment SHALL notify dependent effects.

#### Scenario: Create reactive state
- **WHEN** `const state = reactive({ name: "bob", age: 30 })` is called
- **THEN** `state.name` SHALL be `"bob"` and `state.age` SHALL be `30`

#### Scenario: Mutate via assignment
- **WHEN** `state.name = "jane"` is assigned
- **THEN** `state.name` SHALL be `"jane"` and any effect that read `state.name` SHALL re-run

### Requirement: reactive tracks nested object properties
When a property access on a reactive object returns another object, the returned object SHALL also be proxied. Nested property reads SHALL be independently trackable.

#### Scenario: Nested property tracking
- **WHEN** `const state = reactive({ user: { name: "bob" } })` is created and an effect reads `state.user.name`
- **THEN** changing `state.user.name = "jane"` SHALL re-run only effects that read `state.user.name`, not effects that only read other properties

#### Scenario: Replacing a nested object
- **WHEN** `state.user = { name: "alice" }` is assigned
- **THEN** effects that read `state.user` or `state.user.name` SHALL re-run

### Requirement: reactive tracks array access
Reactive objects containing arrays SHALL track array index access and length. Array replacement via assignment SHALL notify effects that read the array.

#### Scenario: Array element access tracked
- **WHEN** `const state = reactive({ items: ["a", "b", "c"] })` is created and an effect reads `state.items[0]`
- **THEN** the effect SHALL be subscribed to changes affecting that access

#### Scenario: Array replacement triggers effects
- **WHEN** `state.items = [...state.items, "d"]` is assigned
- **THEN** effects that read `state.items` SHALL re-run

#### Scenario: Array element property tracking
- **WHEN** `const state = reactive({ todos: [{ title: "buy milk", completed: false }] })` is created and an effect reads `state.todos[0].completed`
- **THEN** assigning `state.todos[0].completed = true` SHALL re-run that effect

### Requirement: reactive preserves object identity for proxies
Repeated access to the same nested object SHALL return the same proxy instance. Proxy wrapping SHALL be cached via WeakMap.

#### Scenario: Stable proxy identity
- **WHEN** `state.user` is accessed twice
- **THEN** both accesses SHALL return the same proxy object (`state.user === state.user`)

### Requirement: reactive returns the same type shape
`reactive<T>(obj: T)` SHALL return type `T`. The proxy SHALL be transparent to TypeScript — property access, assignment, and iteration SHALL work with the original type's shape.

#### Scenario: Type preservation
- **WHEN** `const state = reactive({ count: 0 })` is created
- **THEN** `state.count` SHALL be typed as `number` and `state.count = 1` SHALL be valid TypeScript
