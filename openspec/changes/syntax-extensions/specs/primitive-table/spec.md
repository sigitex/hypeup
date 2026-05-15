## MODIFIED Requirements

### Requirement: Primitive table built from lexicon data
The primitive table SHALL be built at plugin-init by importing `htmlTags`, `voidHtmlTags`, `atRules`, and `cssProperties` from `@hypeup/lexicon/primitives`. It SHALL NOT hardcode any identifier lists. The `buildDslPrimitives()` function SHALL accept an optional `extensions` parameter (array of `HypeupExtension` objects). When provided, aliases and constants from each extension SHALL be merged into the table after built-in primitives are registered. Aliases SHALL be resolved by looking up the target name in the table. Constants SHALL be added as a new `constant` primitive kind.

#### Scenario: HTML tags loaded
- **WHEN** the plugin initializes
- **THEN** every tag in `htmlTags` SHALL be registered as a primitive of kind `htmlElement` with `isVoid: false`

#### Scenario: Void tags loaded
- **WHEN** the plugin initializes
- **THEN** every tag in `voidHtmlTags` SHALL be registered as a primitive of kind `htmlElement` with `isVoid: true`

#### Scenario: At-rules loaded
- **WHEN** the plugin initializes
- **THEN** every entry in `atRules` SHALL be registered as a primitive of kind `atRule` with its keyword string

#### Scenario: CSS properties loaded
- **WHEN** the plugin initializes
- **THEN** every entry in `cssProperties` SHALL be registered as a primitive of kind `cssProperty` with its `cssName` and `keywords`

#### Scenario: Extension aliases merged
- **WHEN** the plugin initializes with extensions containing aliases
- **THEN** each alias SHALL be registered in the table with the same `Primitive` value as its target

#### Scenario: Extension constants merged
- **WHEN** the plugin initializes with extensions containing constants
- **THEN** each constant SHALL be registered in the table as a `constant` kind primitive with `cssName` and `value`
