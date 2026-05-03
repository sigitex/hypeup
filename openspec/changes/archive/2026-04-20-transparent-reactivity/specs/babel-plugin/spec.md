## MODIFIED Requirements

### Requirement: HTML element lowering
The plugin SHALL rewrite HTML element calls to `elem()` or `elemVoid()` based on the tag's void-ness from the primitive table. Each user-provided argument SHALL be wrapped in an arrow function thunk `() => expr` for deferred evaluation. `className()` calls generated from class chains SHALL NOT be wrapped.

#### Scenario: Standard element call
- **WHEN** source contains `div("hello")`
- **THEN** output SHALL be `elem("div", [() => "hello"])`

#### Scenario: Void element call
- **WHEN** source contains `br()`
- **THEN** output SHALL be `elemVoid("br", [])`

#### Scenario: Void element with attributes
- **WHEN** source contains `img({ src: "x.png" })`
- **THEN** output SHALL be `elemVoid("img", [() => ({ src: "x.png" })])`

#### Scenario: Element with multiple arguments
- **WHEN** source contains `div("hello", myVar, { id: "main" })`
- **THEN** output SHALL be `elem("div", [() => "hello", () => myVar, () => ({ id: "main" })])`

### Requirement: Class chain lowering
The plugin SHALL rewrite member-expression chains on HTML elements into `elem()` calls with one `className()` per chain segment. Each class name SHALL be kebabized (camelCase to kebab-case). `className()` calls SHALL NOT be wrapped in thunks. User-provided arguments SHALL be wrapped.

#### Scenario: Single class
- **WHEN** source contains `div.active("hello")`
- **THEN** output SHALL be `elem("div", [className("active"), () => "hello"])`

#### Scenario: Multiple classes
- **WHEN** source contains `div.active.large("hello")`
- **THEN** output SHALL be `elem("div", [className("active"), className("large"), () => "hello"])`

#### Scenario: CamelCase class kebabized
- **WHEN** source contains `div.activeItem("hello")`
- **THEN** output SHALL be `elem("div", [className("active-item"), () => "hello"])`
