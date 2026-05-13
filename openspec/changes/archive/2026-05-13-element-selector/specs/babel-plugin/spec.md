## ADDED Requirements

### Requirement: rule() call form accepts HTML element identifier as selector
When the first argument to `rule()` is an unbound identifier that maps to an HTML element in the primitive table, the babel plugin SHALL replace it with a string literal of the element's tag name. The remaining arguments SHALL be treated as rule contents, matching existing `rule()` call form behavior.

#### Scenario: Element identifier converted to tag string
- **WHEN** source contains `rule(pre, color("red"))`
- **THEN** the output SHALL compile to `rule("pre", [color("red")])` with `pre` replaced by the string literal `"pre"`

#### Scenario: Void element identifier converted to tag string
- **WHEN** source contains `rule(hr, borderColor("black"))`
- **THEN** the output SHALL compile to `rule("hr", [borderColor("black")])` with `hr` replaced by the string literal `"hr"`

#### Scenario: _var identifier uses tag field
- **WHEN** source contains `rule(_var, fontStyle("italic"))`
- **THEN** the output SHALL compile to `rule("var", [fontStyle("italic")])` using the primitive's `tag` field `"var"`, not the identifier name `"_var"`

#### Scenario: String selector unchanged
- **WHEN** source contains `rule(".foo", color("red"))`
- **THEN** the output SHALL compile to `rule(".foo", [color("red")])` — string selectors are unaffected

#### Scenario: Locally-bound identifier not converted
- **WHEN** source contains `const div = ".my-div"; rule(div, color("red"))`
- **THEN** the `div` argument SHALL NOT be replaced with `"div"` — it is a local binding, not the DSL global

#### Scenario: Non-element identifier left as-is
- **WHEN** source contains `rule(mySelector, color("red"))` where `mySelector` is not in the primitive table
- **THEN** `mySelector` SHALL be passed through as-is (existing behavior)
