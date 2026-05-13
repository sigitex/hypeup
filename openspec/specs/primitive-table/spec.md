## ADDED Requirements

### Requirement: Primitive table built from lexicon data
The primitive table SHALL be built at plugin-init by importing `htmlTags`, `voidHtmlTags`, `atRules`, and `cssProperties` from `@hypeup/lexicon/primitives`. It SHALL NOT hardcode any identifier lists.

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

### Requirement: Escape hatches registered as primitives
The primitive table SHALL include hardcoded entries for escape-hatch identifiers: `elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `className`, `cssString`, `doctype`, `each`, `lazy`. All of these SHALL use the default runtime module (`@hypeup/runtime`). The client-only helpers `on`, `redraw`, and `ref` SHALL remain sourced from `@hypeup/client`.

#### Scenario: Escape hatch lookup
- **WHEN** the identifier `elem` is looked up in the primitive table
- **THEN** it SHALL return a primitive of kind `escapeHatch` with no explicit module (defaulting to `@hypeup/runtime`)

#### Scenario: each lookup
- **WHEN** the identifier `each` is looked up in the primitive table
- **THEN** it SHALL return a primitive of kind `escapeHatch` with no explicit module (defaulting to `@hypeup/runtime`)

#### Scenario: lazy lookup
- **WHEN** the identifier `lazy` is looked up in the primitive table
- **THEN** it SHALL return a primitive of kind `escapeHatch` with no explicit module (defaulting to `@hypeup/runtime`)

#### Scenario: Client-only helpers remain in client
- **WHEN** the identifiers `on`, `redraw`, or `ref` are looked up in the primitive table
- **THEN** they SHALL return primitives of kind `escapeHatch` with `module: "@hypeup/client"`

### Requirement: Primitive lookup is O(1)
The primitive table SHALL support O(1) lookup by identifier name (e.g., via a `Map` or plain object).

#### Scenario: Fast lookup
- **WHEN** any identifier name is looked up
- **THEN** the lookup SHALL complete in constant time regardless of table size

### Requirement: Keyword collision names mapped correctly
HTML tags and CSS properties with JS keyword collisions SHALL use their mapped names from the lexicon generator (e.g., `_var` for `<var>`, `_continue` for CSS keyword `continue`).

#### Scenario: _var maps to var tag
- **WHEN** identifier `_var` is looked up
- **THEN** it SHALL return an `htmlElement` primitive with `tag: "var"`
