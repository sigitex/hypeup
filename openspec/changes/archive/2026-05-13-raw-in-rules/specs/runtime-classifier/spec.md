## MODIFIED Requirements

### Requirement: classifyRule returns sorted slots
The `classifyRule` function SHALL accept `(contents: Content[])` and return an object with `properties: Record<string, string>`, `rules: Rule[]`, and `children: any[]`. `Raw` nodes SHALL be routed to the `children` slot.

#### Scenario: Property routes to properties slot
- **WHEN** contents include `new Property("color", "red")`
- **THEN** the result SHALL have `properties["color"] === "red"`

#### Scenario: Nested Rule routes to rules slot
- **WHEN** contents include `new Rule(".bar", [new Property("font-size", "12px")])`
- **THEN** the result SHALL have `rules` containing the nested Rule

#### Scenario: Raw routes to children slot
- **WHEN** contents include `new Raw("/* comment */")`
- **THEN** the result SHALL have `children` containing the Raw node

#### Scenario: Array contents are flattened
- **WHEN** contents include `[new Property("a", "1"), new Property("b", "2")]`
- **THEN** the result SHALL have both properties

#### Scenario: Empty values are skipped
- **WHEN** contents include `undefined`, `null`, or `false`
- **THEN** those values SHALL not appear in any slot

#### Scenario: CssClass is silently ignored
- **WHEN** contents include `new CssClass("active")`
- **THEN** it SHALL not appear in any slot (CssClass is element-only)

### Requirement: classifyAtRule returns sorted slots
The `classifyAtRule` function SHALL accept `(contents: Content[])` and return an object with `properties: Record<string, string>` and `children: Content[]`. `Raw` nodes SHALL be routed to the `children` slot.

#### Scenario: Property routes to properties slot
- **WHEN** contents include `new Property("font-family", "Arial")`
- **THEN** the result SHALL have `properties["font-family"] === "Arial"`

#### Scenario: Rule routes to children slot
- **WHEN** contents include `new Rule(".foo", [new Property("color", "red")])`
- **THEN** the result SHALL have `children` containing the Rule

#### Scenario: Raw routes to children slot
- **WHEN** contents include `new Raw("/* raw css */")`
- **THEN** the result SHALL have `children` containing the Raw node

#### Scenario: Array contents are flattened
- **WHEN** contents include `[new Property("a", "1"), new Rule(".b", [])]`
- **THEN** the result SHALL have the property and the rule in their respective slots

#### Scenario: CssClass is silently ignored
- **WHEN** contents include `new CssClass("active")`
- **THEN** it SHALL not appear in any slot (CssClass is element-only)
