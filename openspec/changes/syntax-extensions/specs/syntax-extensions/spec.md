## ADDED Requirements

### Requirement: HypeupExtension type defines extension shape
A `HypeupExtension` SHALL be a `Record<string, ExtensionSymbol>` where keys are identifier names (possibly dotted, e.g., `"container.sm"`) and values are a discriminated union by `type`. The `HypeupExtension` and `ExtensionSymbol` types SHALL be exported from `@hypeup/babel`.

### Requirement: Alias symbol transforms identically to target
An `{ type: "alias", target: string }` symbol SHALL produce the exact same transform output as its target primitive. The alias identifier SHALL support all syntax forms that the target supports. Aliases MAY target built-in primitives or extension-defined symbols (resolved in array order).

#### Scenario: Alias of CSS property in call form
- **WHEN** source contains `fs("14px")` and `fs` is `{ type: "alias", target: "fontSize" }`
- **THEN** output SHALL be identical to `fontSize("14px")` — i.e., `prop("font-size", "14px")`

#### Scenario: Alias of CSS property with keyword access
- **WHEN** source contains `fs.inherit` and `fs` is aliased to `fontSize`
- **THEN** output SHALL be identical to `fontSize.inherit` — i.e., `prop("font-size", "inherit")`

#### Scenario: Alias of builtin
- **WHEN** source contains `cc("active")` and `cc` is aliased to `className`
- **THEN** output SHALL be identical to `className("active")`

#### Scenario: Alias of HTML element
- **WHEN** source contains `d("hello")` and `d` is aliased to `div`
- **THEN** output SHALL be identical to `div("hello")`

#### Scenario: Alias of extension-defined symbol
- **WHEN** extension A defines `container` as an element symbol and extension B defines `box` as `{ type: "alias", target: "container" }`
- **THEN** `box("hello")` SHALL produce the same output as `container("hello")`

#### Scenario: Alias respects scope shadowing
- **WHEN** source contains `const fs = myFn; fs("14px")` and `fs` is aliased to `fontSize`
- **THEN** the `fs` call SHALL NOT be rewritten

### Requirement: Prop constants expand to fixed prop() calls
A `{ type: "prop", css: string, value: string }` symbol SHALL be replaced with `prop(css, value)` when encountered as a bare reference. SHALL NOT be transformed in call position or member-expression position (unless a dotted-path match exists).

#### Scenario: Bare prop constant
- **WHEN** source contains `m4` as an expression and `m4` is `{ type: "prop", css: "margin", value: "4px" }`
- **THEN** output SHALL be `prop("margin", "4px")`

#### Scenario: Prop constant in call position NOT transformed
- **WHEN** source contains `m4("8px")`
- **THEN** `m4` SHALL NOT be transformed

#### Scenario: Prop constant in member-expression with no dotted-path match NOT transformed
- **WHEN** source contains `m4.foo` and no `"m4.foo"` entry exists
- **THEN** `m4` SHALL NOT be transformed

### Requirement: ClassName constants expand to fixed className() calls
A `{ type: "className", value: string }` symbol SHALL be replaced with `className(value)` when encountered as a bare reference. SHALL NOT be transformed in call position or member-expression position (unless a dotted-path match exists).

#### Scenario: Bare className constant
- **WHEN** source contains `active` as an expression and `active` is `{ type: "className", value: "active" }`
- **THEN** output SHALL be `className("active")`

### Requirement: Element constants expand to elem() calls
A `{ type: "element", tag, className?, props?, attrs? }` symbol SHALL expand to `elem(tag, [...prebakedChildren, ...userArgs])` or `elemVoid(tag, [...prebakedChildren])` (void inferred from tag). Prebaked children ordering: className first, then props, then attrs.

#### Scenario: Element constant bare call
- **WHEN** source contains `container("hello")` and `container` is `{ type: "element", tag: "div", className: "container" }`
- **THEN** output SHALL be `elem("div", [className("container"), () => "hello"])`

#### Scenario: Element constant bare reference
- **WHEN** source contains bare `container` (not a call)
- **THEN** output SHALL be `elem("div", [className("container")])`

#### Scenario: Element constant with all prebaked children
- **WHEN** `container` is `{ type: "element", tag: "div", className: "container", props: { display: "flex" }, attrs: { role: "region" } }`
- **THEN** output SHALL include `className("container")`, then `prop("display", "flex")`, then `attr("role", "region")`, then user args

#### Scenario: Element constant void tag
- **WHEN** `logo` is `{ type: "element", tag: "img", attrs: { src: "/logo.png" } }`
- **THEN** output SHALL use `elemVoid` instead of `elem`

#### Scenario: Element constant dot-segment class chaining
- **WHEN** source contains `container.active("hello")` and no `"container.active"` dotted-path entry exists
- **THEN** `active` SHALL become an additional `className("active")` call after prebaked children, before user args

### Requirement: Dotted-path keys are first-class table entries
Extension keys containing dots (e.g., `"m4.x"`, `"container.sm"`) SHALL be stored as-is in the primitive table. Lookup SHALL use longest-match-first against progressively shorter prefixes.

#### Scenario: Dotted-path prop constant
- **WHEN** source contains `m4.x` and `"m4.x"` is `{ type: "prop", css: "margin-inline", value: "4px" }`
- **THEN** output SHALL be `prop("margin-inline", "4px")`

#### Scenario: Longest-match with fallback
- **WHEN** `"container.sm"` is registered as an element symbol and source contains `container.sm.active("hello")`
- **THEN** `"container.sm"` SHALL match and `active` SHALL become a className

#### Scenario: Dotted-path with no root entry
- **WHEN** `"m4.x"` is registered but `"m4"` is not, and source contains bare `m4`
- **THEN** `m4` SHALL NOT be transformed

#### Scenario: Dotted-path with alias interaction
- **WHEN** `fs` is an alias for `fontSize` and `"fs.sm"` is a prop constant
- **THEN** `fs.sm` SHALL match the dotted-path entry; `fs.inherit` SHALL fall back to alias behavior (keyword access on fontSize)

### Requirement: Scope shadowing suppresses entire chain
If the root identifier of a dotted-path chain has a local binding, the entire chain SHALL NOT be transformed.

#### Scenario: Shadowed root suppresses dotted-path
- **WHEN** source contains `const m4 = { x: myFunc }; m4.x` and `"m4.x"` is registered
- **THEN** `m4.x` SHALL NOT be transformed

### Requirement: Invalid alias target throws at init
If an alias references a name that does not exist in the table at resolution time, `buildDslPrimitives()` SHALL throw.

### Requirement: Symbol collisions throw at init
If an extension defines a key that already exists in the primitive table, `buildDslPrimitives()` SHALL throw.

#### Scenario: Extension collides with built-in
- **WHEN** an extension defines key `div`
- **THEN** init SHALL throw

#### Scenario: Two extensions collide
- **WHEN** two extensions both define key `fs`
- **THEN** init SHALL throw

### Requirement: Multiple extensions aggregate in array order
The plugin SHALL accept an array of `HypeupExtension` objects. All entries SHALL be merged into the primitive table in array order. Later extensions MAY alias symbols defined by earlier extensions.
