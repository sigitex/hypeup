## ADDED Requirements

### Requirement: Plugin accepts extensions option
The `hypeupBabelPlugin()` function SHALL accept an optional options object with an `extensions` field (array of `HypeupExtension`). The extensions SHALL be passed to `buildDslPrimitives()` to populate the primitive table.

#### Scenario: Plugin with extensions option
- **WHEN** the plugin is initialized with `{ extensions: [{ aliases: { fs: "fontSize" } }] }`
- **THEN** the primitive table SHALL include the `fs` alias and the plugin SHALL transform `fs(...)` calls

#### Scenario: Plugin without extensions option
- **WHEN** the plugin is initialized without options
- **THEN** behavior SHALL be identical to current behavior — only built-in primitives are recognized

### Requirement: Constant primitive handler
The plugin SHALL handle primitives of kind `constant` by replacing the identifier with a `prop(cssName, value)` call. The handler SHALL skip identifiers that appear as the callee of a `CallExpression`.

#### Scenario: Constant replaced with prop call
- **WHEN** a `constant` primitive identifier is encountered as a bare reference
- **THEN** it SHALL be replaced with `prop(cssName, value)` using the primitive's stored values

#### Scenario: Constant in call position skipped
- **WHEN** a `constant` primitive identifier is encountered as the callee of a call expression
- **THEN** it SHALL NOT be transformed
