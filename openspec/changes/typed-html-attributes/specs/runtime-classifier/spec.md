## MODIFIED Requirements

### Requirement: classifyElement returns sorted slots
The `classifyElement` function SHALL accept `(contents: Content[], isVoid: boolean)` and return an object with `attributes: Record<string, string | true>`, `properties: Record<string, string>`, `classes: string[]`, and `children: Content[]`. Attribute values of `true` SHALL be preserved as presence-only attributes. Falsey object attribute values SHALL be skipped.

#### Scenario: Property routes to properties slot
- **WHEN** contents include `new Property("color", "red")`
- **THEN** the result SHALL have `properties["color"] === "red"`

#### Scenario: Attr routes to attributes slot
- **WHEN** contents include `new Attr("href", "/home")`
- **THEN** the result SHALL have `attributes["href"] === "/home"`

#### Scenario: True Attr routes to presence attribute
- **WHEN** contents include `new Attr("disabled", true)`
- **THEN** the result SHALL have `attributes["disabled"] === true`

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

#### Scenario: True object attribute routes to presence attribute
- **WHEN** contents include `{disabled: true}`
- **THEN** the result SHALL have `attributes["disabled"] === true`

#### Scenario: False object attribute is skipped
- **WHEN** contents include `{disabled: false}`
- **THEN** the result SHALL NOT include `attributes["disabled"]`

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
