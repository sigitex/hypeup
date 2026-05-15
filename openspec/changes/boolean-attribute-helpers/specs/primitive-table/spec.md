## ADDED Requirements

### Requirement: Boolean attributes loaded into primitive table
The primitive table SHALL import `booleanAttrs` from `@hypeup/lexicon/primitives` and register each entry as a primitive of kind `booleanAttr` with its HTML attribute name.

#### Scenario: Boolean attribute lookup
- **WHEN** the identifier `checked` is looked up in the primitive table
- **THEN** it SHALL return a primitive of kind `booleanAttr` with `attrName: "checked"`

#### Scenario: Dollar-suffix boolean attribute lookup
- **WHEN** the identifier `async$` is looked up in the primitive table
- **THEN** it SHALL return a primitive of kind `booleanAttr` with `attrName: "async"`
