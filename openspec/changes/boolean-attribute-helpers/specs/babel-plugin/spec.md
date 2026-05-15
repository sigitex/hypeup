## ADDED Requirements

### Requirement: Boolean attribute bare reference transform
The babel plugin SHALL handle primitives of kind `booleanAttr`. When a bare (non-call, non-member) reference to a boolean attribute identifier is encountered, it SHALL be replaced with a call expression `attr("attrName", true)`, where `attr` is imported from `@hypeup/runtime`.

#### Scenario: Bare boolean attribute in element
- **WHEN** source contains `input(checked)`
- **THEN** output SHALL replace `checked` with `attr("checked", true)` and import `attr` from `@hypeup/runtime`

#### Scenario: Multiple boolean attributes
- **WHEN** source contains `input(checked, disabled, required)`
- **THEN** each of `checked`, `disabled`, `required` SHALL be replaced with their respective `attr(name, true)` calls

#### Scenario: Boolean attribute not intercepted when locally bound
- **WHEN** source contains `const disabled = false; input(disabled)`
- **THEN** `disabled` SHALL NOT be transformed because it has a local binding

#### Scenario: Boolean attribute not intercepted in non-reference position
- **WHEN** source contains `const checked = true` (declaration, not reference)
- **THEN** the `checked` in the declaration SHALL NOT be transformed

#### Scenario: Call expression on boolean attribute is not transformed
- **WHEN** source contains `checked()` and `checked` is not locally bound
- **THEN** the plugin SHALL NOT transform this — `booleanAttr` primitives only handle bare references
