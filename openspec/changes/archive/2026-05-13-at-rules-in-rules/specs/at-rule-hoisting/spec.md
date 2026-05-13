## ADDED Requirements

### Requirement: classifyRule collects AtRule instances
`classifyRule` SHALL recognize `AtRule` instances in a rule's contents and collect them into an `atRules: AtRule[]` slot in the returned `RuleSlots` object. `AtRule` instances SHALL NOT be silently dropped.

#### Scenario: Single at-rule in rule contents
- **WHEN** `classifyRule` receives contents containing an `AtRule` instance
- **THEN** the returned `RuleSlots.atRules` array SHALL contain that `AtRule` instance

#### Scenario: Mixed properties, rules, and at-rules
- **WHEN** `classifyRule` receives contents containing `Property`, `Rule`, and `AtRule` instances
- **THEN** properties SHALL be in `RuleSlots.properties`, rules in `RuleSlots.rules`, and at-rules in `RuleSlots.atRules`

#### Scenario: AtRule nested in array contents
- **WHEN** `classifyRule` receives contents containing an array that includes an `AtRule`
- **THEN** the `AtRule` SHALL be collected into `RuleSlots.atRules` via recursive array walking

### Requirement: renderRule hoists at-rules with selector wrapping
`renderRule` SHALL emit each collected `AtRule` as a top-level at-rule block, with the parent rule's fully-composed selector re-applied inside the at-rule body.

#### Scenario: Simple rule with media query
- **WHEN** rendering `rule(".card", color.red, $media("(min-width: 600px)", padding(20)))`
- **THEN** output SHALL be `.card{color:red}@media (min-width: 600px){.card{padding:20px}}`

#### Scenario: Nested rule with at-rule uses composed selector
- **WHEN** rendering `rule(".card", rule(".child", $media("(min-width: 600px)", padding(20))))`
- **THEN** the at-rule SHALL hoist with the composed selector: `@media (min-width: 600px){.card .child{padding:20px}}`

#### Scenario: Rule with multiple at-rules
- **WHEN** rendering a rule containing multiple `AtRule` instances (e.g., `$media(...)` and `$supports(...)`)
- **THEN** each at-rule SHALL be emitted as its own separate block, in the order they appear in the contents

#### Scenario: At-rule with rule parameter and no body properties
- **WHEN** rendering a rule containing an at-rule that has only nested rules in its contents (no direct properties)
- **THEN** the at-rule SHALL still emit with the parent selector wrapping the nested content

### Requirement: At-rules emit after declarations and nested rules
`renderRule` SHALL emit content in the order: own CSS declarations, then nested rules, then hoisted at-rules.

#### Scenario: Rule with properties and at-rule
- **WHEN** rendering `rule(".card", color.red, $media("(min-width: 600px)", padding(20)))`
- **THEN** `.card{color:red}` SHALL appear before `@media (min-width: 600px){.card{padding:20px}}`

#### Scenario: Rule with nested rule and at-rule
- **WHEN** rendering a rule with own properties, a nested rule, and an at-rule
- **THEN** own properties emit first, then the nested rule, then the hoisted at-rule

### Requirement: At-rule hoisting works with comma-separated selectors
When the parent rule has comma-separated selectors, each selector SHALL be applied inside the hoisted at-rule.

#### Scenario: Comma-separated selectors with at-rule
- **WHEN** rendering `rule(".card,.panel", $media("(min-width: 600px)", padding(20)))`
- **THEN** output SHALL include `@media (min-width: 600px){.card,.panel{padding:20px}}`

### Requirement: At-rule contents rendered recursively
The at-rule body contents SHALL be rendered through the existing `renderRule` path, supporting properties, nested rules, and further at-rules within the hoisted block.

#### Scenario: At-rule body with multiple properties
- **WHEN** an at-rule inside a rule contains multiple `Property` instances
- **THEN** all properties SHALL be rendered inside the selector block within the at-rule

#### Scenario: At-rule body with nested rule
- **WHEN** an at-rule inside a rule contains a nested `Rule`
- **THEN** the nested rule SHALL be rendered with proper selector composition inside the at-rule block
