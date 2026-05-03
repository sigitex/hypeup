## ADDED Requirements

### Requirement: each() global recognition
The babel plugin SHALL recognize `each` as a DSL global identifier (similar to `on`, `reactive`, `signal`). When `each(...)` is encountered as a free global reference (not a local binding), it SHALL be rewritten to an import from `@hypeup/client`.

#### Scenario: each call rewritten to import
- **WHEN** source contains `each(state.items, i => i.id, i => li(i.name))`
- **THEN** output SHALL import `each` from `@hypeup/client` and preserve the call as `each(state.items, i => i.id, i => li(i.name))`

#### Scenario: each arguments not thunk-wrapped
- **WHEN** source contains `each(state.items, i => i.id, i => li(i.name))`
- **THEN** the arguments to `each()` SHALL NOT be wrapped in thunks — they are passed as-is (the key function and map function are already functions)

#### Scenario: each with local binding not rewritten
- **WHEN** source contains `const each = myFn; each(items)`
- **THEN** the `each` call SHALL NOT be rewritten (it is a local binding, not the DSL global)

#### Scenario: each inside element contents
- **WHEN** source contains `ul(each(state.items, i => i.id, i => li(i.name)))`
- **THEN** the `each(...)` call inside `ul()` SHALL be rewritten to the imported `each`, and the outer `ul()` SHALL be processed normally with the `each(...)` result wrapped in a thunk as a standard argument
