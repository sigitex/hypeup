## ADDED Requirements

### Requirement: HypeupExtension type defines extension shape
The `HypeupExtension` type SHALL be exported from `@hypeup/babel`. It SHALL have two optional fields: `aliases` (a `Record<string, string>` mapping alias names to existing primitive names) and `constants` (a `Record<string, [string, string]>` mapping constant names to `[cssPropertyName, value]` tuples).

#### Scenario: Extension with aliases only
- **WHEN** an extension is defined as `{ aliases: { fs: "fontSize", bg: "backgroundColor" } }`
- **THEN** it SHALL be a valid `HypeupExtension`

#### Scenario: Extension with constants only
- **WHEN** an extension is defined as `{ constants: { m4: ["margin", "4px"], flex: ["display", "flex"] } }`
- **THEN** it SHALL be a valid `HypeupExtension`

#### Scenario: Extension with both aliases and constants
- **WHEN** an extension is defined with both `aliases` and `constants` fields
- **THEN** it SHALL be a valid `HypeupExtension`

### Requirement: Alias transforms identically to target
An alias SHALL produce the exact same transform output as its target primitive. The alias identifier SHALL support all syntax forms that the target supports (call form, keyword access, class chains, etc.).

#### Scenario: Alias of CSS property in call form
- **WHEN** source contains `fs("14px")` and `fs` is aliased to `fontSize`
- **THEN** output SHALL be identical to the output of `fontSize("14px")` — i.e., `prop("font-size", "14px")`

#### Scenario: Alias of CSS property with keyword access
- **WHEN** source contains `fs.inherit` and `fs` is aliased to `fontSize`
- **THEN** output SHALL be identical to the output of `fontSize.inherit` — i.e., `prop("font-size", "inherit")`

#### Scenario: Alias of builtin in call form
- **WHEN** source contains `cc("active")` and `cc` is aliased to `className`
- **THEN** output SHALL be identical to the output of `className("active")`

#### Scenario: Alias of HTML element
- **WHEN** source contains `d("hello")` and `d` is aliased to `div`
- **THEN** output SHALL be identical to the output of `div("hello")` — i.e., `elem("div", [() => "hello"])`

#### Scenario: Alias respects scope shadowing
- **WHEN** source contains `const fs = myFn; fs("14px")` and `fs` is aliased to `fontSize`
- **THEN** the `fs` call SHALL NOT be rewritten — local bindings take precedence

### Requirement: Constants expand to fixed prop() calls
A constant identifier SHALL be replaced with a `prop(cssName, value)` call when encountered as a bare reference (not as a callee or member-expression object). The `prop` helper SHALL be imported from `@hypeup/runtime`.

#### Scenario: Bare constant reference
- **WHEN** source contains `m4` as an expression and `m4` is a constant for `["margin", "4px"]`
- **THEN** output SHALL be `prop("margin", "4px")` with `prop` imported from `@hypeup/runtime`

#### Scenario: Constant inside element children
- **WHEN** source contains `div(m4)` and `m4` is a constant for `["margin", "4px"]`
- **THEN** the `m4` identifier SHALL be replaced with `prop("margin", "4px")` inside the element's contents array

#### Scenario: Constant in call position is NOT transformed
- **WHEN** source contains `m4("8px")` and `m4` is a constant
- **THEN** the `m4` identifier SHALL NOT be transformed — constants are bare-identifier-only

#### Scenario: Constant respects scope shadowing
- **WHEN** source contains `const m4 = something; m4` and `m4` is a constant
- **THEN** the `m4` reference SHALL NOT be rewritten — local bindings take precedence

### Requirement: Invalid alias target throws at init
If an alias references a primitive name that does not exist in the table, `buildDslPrimitives()` SHALL throw an error at plugin initialization time.

#### Scenario: Alias to nonexistent primitive
- **WHEN** an extension defines `{ aliases: { fs: "nonexistent" } }`
- **THEN** plugin initialization SHALL throw an error indicating the alias target does not exist

### Requirement: Symbol collisions throw at init
If an extension defines a symbol name that already exists in the primitive table (from built-ins or a previously processed extension), `buildDslPrimitives()` SHALL throw an error at plugin initialization time.

#### Scenario: Extension collides with built-in
- **WHEN** an extension defines `{ aliases: { div: "span" } }` where `div` is already a built-in HTML element
- **THEN** plugin initialization SHALL throw an error indicating the collision

#### Scenario: Two extensions collide
- **WHEN** two extensions both define a symbol named `fs`
- **THEN** plugin initialization SHALL throw an error indicating the collision

### Requirement: Multiple extensions aggregate
The plugin SHALL accept an array of `HypeupExtension` objects. All aliases and constants from all extensions SHALL be merged into the primitive table, processed in array order.

#### Scenario: Symbols from multiple extensions
- **WHEN** extension A defines `{ aliases: { fs: "fontSize" } }` and extension B defines `{ constants: { m4: ["margin", "4px"] } }`
- **THEN** both `fs` and `m4` SHALL be recognized and transformed
