## ADDED Requirements

### Requirement: Generated attribute maps
The lexicon generator SHALL generate an `AttributeMap` type that maps generated HTML tag names to object attribute types. Each tag-specific attribute type SHALL include global HTML attributes and attributes allowed for that tag by the configured attribute data sources.

#### Scenario: Global attributes are available on every tag
- **WHEN** a consumer writes `div({ id: "main", class: "container" })`
- **THEN** TypeScript SHALL accept the attributes because `id` and `class` are global HTML attributes

#### Scenario: Tag-specific attributes are available only on matching tags
- **WHEN** a consumer writes `input({ placeholder: "Email" })`
- **THEN** TypeScript SHALL accept `placeholder` for `input`
- **WHEN** a consumer writes `div({ placeholder: "Email" })`
- **THEN** TypeScript SHALL reject `placeholder` for `div`

### Requirement: Attribute keys use HTML spelling
Generated attribute object keys SHALL use serialized HTML attribute spelling. DOM property aliases SHALL NOT be generated as accepted object keys.

#### Scenario: HTML spelling is accepted
- **WHEN** a consumer writes `input({ readonly: true, maxlength: 20 })`
- **THEN** TypeScript SHALL accept `readonly` and `maxlength`

#### Scenario: DOM aliases are rejected
- **WHEN** a consumer writes `input({ readOnly: true, maxLength: 20 })`
- **THEN** TypeScript SHALL reject `readOnly` and `maxLength`

### Requirement: Enumerated attributes use generated value unions
Generated attribute object types SHALL use string literal unions for enumerated attributes when enumerated attribute data provides known states.

#### Scenario: Valid enumerated value is accepted
- **WHEN** a consumer writes `input({ type: "password" })`
- **THEN** TypeScript SHALL accept the value

#### Scenario: Invalid enumerated value is rejected
- **WHEN** a consumer writes `input({ type: "definitely-not-an-input-type" })`
- **THEN** TypeScript SHALL reject the value

### Requirement: Unknown-valid enumerated attributes allow loose strings
When enumerated attribute data marks an attribute as allowing unknown values, the generated type SHALL include known string literals and arbitrary strings.

#### Scenario: Known target value is accepted
- **WHEN** a consumer writes `a({ target: "_blank" })`
- **THEN** TypeScript SHALL accept the value and offer known target values in IDE completion

#### Scenario: Custom target value is accepted
- **WHEN** a consumer writes `a({ target: "preview-window" })`
- **THEN** TypeScript SHALL accept the arbitrary target name

### Requirement: Boolean attributes accept boolean object values
Generated attribute object types SHALL accept `boolean` for true boolean HTML attributes. A false value SHALL be valid at type level and SHALL mean the attribute is absent at runtime.

#### Scenario: True boolean attribute is accepted
- **WHEN** a consumer writes `input({ disabled: true })`
- **THEN** TypeScript SHALL accept the value

#### Scenario: False boolean attribute is accepted
- **WHEN** a consumer writes `input({ disabled: false })`
- **THEN** TypeScript SHALL accept the value

### Requirement: Booleanish attributes use string values
Attributes whose valid states include textual `"true"` and `"false"` values SHALL be typed as string unions rather than boolean values so explicit false states render as attributes.

#### Scenario: Contenteditable false string is accepted
- **WHEN** a consumer writes `div({ contenteditable: "false" })`
- **THEN** TypeScript SHALL accept the value

#### Scenario: Contenteditable boolean false is rejected
- **WHEN** a consumer writes `div({ contenteditable: false })`
- **THEN** TypeScript SHALL reject the value

### Requirement: Escape hatches remain available
Consumers SHALL be able to bypass generated object attribute typing by using explicit helper calls for custom attributes or tags.

#### Scenario: Custom attribute via attr helper
- **WHEN** a consumer writes `div(attr("custom-attr", value))`
- **THEN** TypeScript SHALL accept the custom attribute helper call

#### Scenario: Custom tag via elem helper
- **WHEN** a consumer writes `elem("my-widget", attr("custom-attr", value))`
- **THEN** TypeScript SHALL accept the custom tag and attribute helper calls

### Requirement: Generated IDE docs
Generated element and attribute declarations SHALL include JSDoc summaries derived from available element, attribute, MDN, and spec metadata.

#### Scenario: Element docs include links when available
- **WHEN** a consumer hovers over `input` in an IDE
- **THEN** the generated docs SHALL identify it as a virtual `input` HTML element and include MDN or spec links when available

#### Scenario: Attribute docs include values when available
- **WHEN** a consumer hovers over the `type` attribute in `input({ type: "password" })`
- **THEN** the generated docs SHALL identify the HTML `type` attribute for `<input>` and include known allowed values or documentation links when available
