## MODIFIED Requirements

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
