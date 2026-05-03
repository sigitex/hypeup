## ADDED Requirements

### Requirement: classifyElement returns sorted slots
The `classifyElement` function SHALL accept `(contents: Content[], isVoid: boolean)` and return an object with `attributes: Record<string, string>`, `properties: Record<string, string>`, `classes: string[]`, and `children: Content[]`.

#### Scenario: Property routes to properties slot
- **WHEN** contents include `new Property("color", "red")`
- **THEN** the result SHALL have `properties["color"] === "red"`

#### Scenario: Attr routes to attributes slot
- **WHEN** contents include `new Attr("href", "/home")`
- **THEN** the result SHALL have `attributes["href"] === "/home"`

#### Scenario: CssClass routes to classes slot
- **WHEN** contents include `new CssClass("active")`
- **THEN** the result SHALL have `classes` containing `"active"`

#### Scenario: Element child routes to children slot
- **WHEN** contents include `new Element("span", false, ["hi"])`
- **THEN** the result SHALL have `children` containing the Element

#### Scenario: Raw routes to children slot
- **WHEN** contents include `new Raw("<!-- -->")`
- **THEN** the result SHALL have `children` containing the Raw

#### Scenario: String routes to children slot
- **WHEN** contents include `"hello"`
- **THEN** the result SHALL have `children` containing `"hello"`

#### Scenario: Plain object routes to attributes
- **WHEN** contents include `{id: "main", "data-x": "1"}`
- **THEN** the result SHALL have `attributes["id"] === "main"` and `attributes["data-x"] === "1"`

#### Scenario: Object with class key splits into classes
- **WHEN** contents include `{class: "foo bar"}`
- **THEN** the result SHALL have `classes` containing `"foo"` and `"bar"`

#### Scenario: Duplicate attribute values concatenate
- **WHEN** contents include `{class: "a"}` followed by `{class: "b"}`
- **THEN** the result SHALL have `classes` containing `"a"` and `"b"`

#### Scenario: Array contents are flattened
- **WHEN** contents include `[new Property("color", "red"), "text"]`
- **THEN** the result SHALL have `properties["color"] === "red"` and `children` containing `"text"`

#### Scenario: Empty values are skipped
- **WHEN** contents include `undefined`, `null`, `""`, or `false`
- **THEN** those values SHALL not appear in any slot

#### Scenario: Void element suppresses children
- **WHEN** `classifyElement([new Property("color", "red"), "child text"], true)` is called
- **THEN** `properties["color"]` SHALL equal `"red"` and `children` SHALL be empty

### Requirement: classifyRule returns sorted slots
The `classifyRule` function SHALL accept `(contents: Content[])` and return an object with `properties: Record<string, string>` and `rules: Rule[]`.

#### Scenario: Property routes to properties slot
- **WHEN** contents include `new Property("color", "red")`
- **THEN** the result SHALL have `properties["color"] === "red"`

#### Scenario: Nested Rule routes to rules slot
- **WHEN** contents include `new Rule(".bar", [new Property("font-size", "12px")])`
- **THEN** the result SHALL have `rules` containing the nested Rule

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
The `classifyAtRule` function SHALL accept `(contents: Content[])` and return an object with `properties: Record<string, string>` and `children: Content[]`.

#### Scenario: Property routes to properties slot
- **WHEN** contents include `new Property("font-family", "Arial")`
- **THEN** the result SHALL have `properties["font-family"] === "Arial"`

#### Scenario: Rule routes to children slot
- **WHEN** contents include `new Rule(".foo", [new Property("color", "red")])`
- **THEN** the result SHALL have `children` containing the Rule

#### Scenario: Array contents are flattened
- **WHEN** contents include `[new Property("a", "1"), new Rule(".b", [])]`
- **THEN** the result SHALL have the property and the rule in their respective slots

#### Scenario: CssClass is silently ignored
- **WHEN** contents include `new CssClass("active")`
- **THEN** it SHALL not appear in any slot (CssClass is element-only)

### Requirement: Render uses classifier
`render.ts` SHALL call `classifyElement`, `classifyRule`, and `classifyAtRule` from `@hypeup/runtime` instead of reading pre-sorted fields on node instances. HTML and CSS output SHALL be identical to the current implementation.

#### Scenario: Element renders with classified slots
- **WHEN** `render(elem("div", [prop("color", "red"), className("active"), "hello"]))` is called
- **THEN** the output SHALL be `<div class="active" style="color:red">hello</div>`

#### Scenario: Void element renders without closing tag
- **WHEN** `render(elemVoid("br", []))` is called
- **THEN** the output SHALL be `<br>`

#### Scenario: Rule renders with classified properties and nested rules
- **WHEN** `render(rule(".foo", [prop("color", "red"), rule(".bar", [prop("font-size", "12px")])]))` is called
- **THEN** the output SHALL be `.foo{color:red}.foo .bar{font-size:12px}`

#### Scenario: AtRule renders with classified properties and children
- **WHEN** `render(atRule("media", "(min-width: 600px)", [rule(".foo", [prop("color", "red")])]))` is called
- **THEN** the output SHALL be `@media (min-width: 600px){.foo{color:red}}`
