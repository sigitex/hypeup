## MODIFIED Requirements

### Requirement: Primitive table built from lexicon data and extensions
The primitive table SHALL be built at plugin-init by importing `htmlTags`, `voidHtmlTags`, `atRules`, and `cssProperties` from `@hypeup/lexicon/primitives`. It SHALL NOT hardcode any identifier lists. The `buildDslPrimitives()` function SHALL accept an optional `extensions` parameter (array of `HypeupExtension` objects). When provided, all entries from each extension SHALL be merged into the table after built-in primitives are registered, in array order. Dotted-path keys SHALL be stored as-is in the table.

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

#### Scenario: Extension alias merged
- **WHEN** an extension entry has `type: "alias"` with target `"fontSize"`
- **THEN** the entry SHALL be registered with the same `Primitive` value as `fontSize`

#### Scenario: Extension prop constant merged
- **WHEN** an extension entry has `type: "prop"` with `css: "margin"` and `value: "4px"`
- **THEN** it SHALL be registered as a prop-constant primitive

#### Scenario: Extension className constant merged
- **WHEN** an extension entry has `type: "className"` with `value: "active"`
- **THEN** it SHALL be registered as a className-constant primitive

#### Scenario: Extension element constant merged
- **WHEN** an extension entry has `type: "element"` with `tag: "div"`, `className: "container"`
- **THEN** it SHALL be registered as an element-constant primitive storing tag, className, props, attrs

#### Scenario: Dotted-path key stored as-is
- **WHEN** an extension has key `"m4.x"`
- **THEN** the table SHALL contain an entry keyed by the literal string `"m4.x"`
