## MODIFIED Requirements

### Requirement: Babel plugin rewrites global DSL identifiers
The babel plugin SHALL rewrite unbound global identifiers to namespaced imports. In addition to existing transforms, the plugin SHALL detect PascalCase function calls with at least one argument and wrap them in `lazy(fn, [...args])`. This wrapping SHALL occur regardless of where the call appears (element children, variable assignments, return statements, etc.).

#### Scenario: PascalCase call with args is wrapped
- **WHEN** the source contains `TodoRow(todo, isSelected)` where `TodoRow` is PascalCase and has arguments
- **THEN** the output SHALL contain `lazy(TodoRow, [todo, isSelected])` with `lazy` imported from `@hypeup/client`

#### Scenario: PascalCase call with single arg
- **WHEN** the source contains `Header(count)`
- **THEN** the output SHALL contain `lazy(Header, [count])`

#### Scenario: Zero-arg PascalCase call is NOT wrapped
- **WHEN** the source contains `Header()`
- **THEN** the output SHALL contain `Header()` unchanged — zero-arg calls are NOT wrapped

#### Scenario: Lowercase function call is NOT wrapped
- **WHEN** the source contains `helper(x)` where `helper` is lowercase
- **THEN** the call SHALL NOT be wrapped in `lazy`

#### Scenario: Known JS built-in is NOT wrapped
- **WHEN** the source contains `String(value)` or `Date(x)` or any known built-in constructor
- **THEN** the call SHALL NOT be wrapped in `lazy`

#### Scenario: PascalCase call in variable assignment is wrapped
- **WHEN** the source contains `const row = TodoRow(todo)`
- **THEN** the output SHALL contain `const row = lazy(TodoRow, [todo])`

#### Scenario: PascalCase call inside each() mapFn is wrapped
- **WHEN** the source contains `each(items, keyFn, d => TodoRow(d, state.selected === d.id))`
- **THEN** the `TodoRow(d, state.selected === d.id)` call SHALL be wrapped as `lazy(TodoRow, [d, state.selected === d.id])`

#### Scenario: PascalCase call with new keyword is NOT wrapped
- **WHEN** the source contains `new Element("div", false, [])`
- **THEN** the `new` expression SHALL NOT be wrapped in `lazy`
