## MODIFIED Requirements

### Requirement: No factories or ElementBuilder
The `factories/` directory SHALL be deleted. `ElementBuilder` SHALL be a type-only callable builder abstraction that can be specialized with a content type, not a Proxy-backed runtime factory. The `@hypeup/vdom` package SHALL export no Proxy-backed constructors.

#### Scenario: Package exports
- **WHEN** the `@hypeup/vdom` package is imported
- **THEN** it SHALL export `Element`, `Rule`, `AtRule`, `Property`, `Raw`, `CssClass`, `Attr` and no Proxy-backed runtime factory values

#### Scenario: ElementBuilder is generic
- **WHEN** `ElementBuilder<Content<"input">>` is used as a type
- **THEN** it SHALL represent a callable element constructor whose arguments are specialized to `Content<"input">`
