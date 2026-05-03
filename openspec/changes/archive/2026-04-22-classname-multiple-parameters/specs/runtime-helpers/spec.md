## MODIFIED Requirements

### Requirement: className helper
The `className` function SHALL accept `(...names: string[])` (1 or more strings) and return `CssClass[]`, one `CssClass` per name.

#### Scenario: className with single argument
- **WHEN** `className("active")` is called
- **THEN** the result SHALL be `[CssClass("active")]` — an array containing one `CssClass` with `name === "active"`

#### Scenario: className with multiple arguments
- **WHEN** `className("foo", "bar", "baz")` is called
- **THEN** the result SHALL be `[CssClass("foo"), CssClass("bar"), CssClass("baz")]` — an array of three `CssClass` instances in argument order

#### Scenario: className requires at least one argument
- **WHEN** `className()` is called with no arguments
- **THEN** TypeScript SHALL report a compile-time error (enforced by `...names: [string, ...string[]]` or equivalent rest type requiring at least one element)
