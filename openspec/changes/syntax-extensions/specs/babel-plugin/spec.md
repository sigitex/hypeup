## ADDED Requirements

### Requirement: Plugin accepts extensions option
The `hypeupBabelPlugin()` function SHALL accept an optional options object with an `extensions` field (array of `HypeupExtension`). The extensions SHALL be passed to `buildDslPrimitives()` to populate the primitive table.

#### Scenario: Plugin with extensions option
- **WHEN** the plugin is initialized with `{ extensions: [{ fs: { type: "alias", target: "fontSize" } }] }`
- **THEN** the primitive table SHALL include the `fs` alias and the plugin SHALL transform `fs(...)` calls

#### Scenario: Plugin without extensions option
- **WHEN** the plugin is initialized without options
- **THEN** behavior SHALL be identical to current behavior — only built-in primitives are recognized

### Requirement: Dotted-path lookup in Identifier visitor
The Identifier visitor SHALL, before dispatching to `handlePrimitive()`, check whether the identifier is the root of a member-expression chain that matches a dotted-path key in the primitive table. It SHALL try the longest path first and work down. If a match is found, the matched primitive SHALL be handled and the entire chain consumed.

#### Scenario: Dotted-path match takes priority
- **WHEN** `fs` is an alias for `fontSize` and `"fs.sm"` is a prop constant, and source contains `fs.sm`
- **THEN** the dotted-path match SHALL fire, not the alias's keyword-access behavior

#### Scenario: No dotted-path match falls through
- **WHEN** `fs` is an alias for `fontSize` and source contains `fs.inherit` with no `"fs.inherit"` entry
- **THEN** the existing alias/keyword-access behavior SHALL handle it

### Requirement: Prop constant handler
The plugin SHALL handle primitives of kind prop-constant by replacing the identifier with a `prop(css, value)` call. The handler SHALL skip identifiers in call position or member-expression position (unless dotted-path matched).

### Requirement: ClassName constant handler
The plugin SHALL handle primitives of kind className-constant by replacing the identifier with a `className(value)` call. The handler SHALL skip identifiers in call position or member-expression position (unless dotted-path matched).

### Requirement: Element constant handler
The plugin SHALL handle primitives of kind element-constant by expanding to `elem(tag, [...prebaked, ...user])` or `elemVoid(tag, [...prebaked])`. Void SHALL be inferred from the tag. Prebaked children ordering: className, then props, then attrs. Unmatched dot segments SHALL become additional className calls after prebaked children, before user args.

#### Scenario: Element constant call form
- **WHEN** `container` is an element constant and source contains `container("hello")`
- **THEN** output SHALL be `elem("div", [className("container"), () => "hello"])`

#### Scenario: Element constant with dot-segment fallback
- **WHEN** `container` is an element constant and source contains `container.active("hello")` with no `"container.active"` entry
- **THEN** output SHALL include prebaked children, then `className("active")`, then user args
