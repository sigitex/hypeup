## MODIFIED Requirements

### Requirement: Rule renders with classified properties and nested rules
When `render()` encounters a `Rule`, the renderer SHALL emit the selector, open braces, emit properties, emit any `Raw` children inline, close braces, and then process nested rules for SCSS-style flattening.

#### Scenario: Rule with properties only
- **WHEN** `render(rule(".foo", [prop("color", "red")]))` is called
- **THEN** the output SHALL be `.foo{color:red}`

#### Scenario: Rule with nested rules (flattened)
- **WHEN** `render(rule(".foo", [prop("color", "red"), rule(".bar", [prop("font-size", "12px")])]))` is called
- **THEN** the output SHALL be `.foo{color:red}.foo .bar{font-size:12px}`

#### Scenario: Rule with Raw child
- **WHEN** `render(rule(".foo", [prop("color", "red"), raw("/* comment */")]))` is called
- **THEN** the output SHALL be `.foo{color:red;/* comment */}` with the Raw text emitted inline within the rule braces

#### Scenario: Rule with only Raw children
- **WHEN** `render(rule(".foo", [raw("color: red; font-size: 12px")]))` is called
- **THEN** the output SHALL be `.foo{color: red; font-size: 12px}`

#### Scenario: AtRule with Raw child
- **WHEN** `render(atRule("font-face", null, [prop("font-family", "Arial"), raw("src: url('font.woff2')")]))` is called
- **THEN** the output SHALL include both the property and the raw text within the at-rule block
