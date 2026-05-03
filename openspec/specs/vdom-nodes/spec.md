## ADDED Requirements

### Requirement: Element stores raw contents
The `Element` class SHALL have fields `tag: string`, `isVoid: boolean`, and `contents: Content[]`. It SHALL NOT have `attributes`, `properties`, `classes`, or `children` fields. It SHALL NOT have an `add()` method. The constructor SHALL store the `contents` array as-is without classification.

#### Scenario: Element construction preserves raw contents
- **WHEN** `new Element("div", false, [new Property("color", "red"), "hello", {id: "main"}])` is called
- **THEN** `element.contents` SHALL contain exactly the three items in order: the Property, the string, and the object

#### Scenario: Void element stores contents without filtering
- **WHEN** `new Element("br", true, ["child text"])` is called
- **THEN** `element.contents` SHALL contain `["child text"]` (classification handles void semantics, not the constructor)

### Requirement: Rule stores raw contents
The `Rule` class SHALL have fields `selector: string` and `contents: Content[]`. It SHALL NOT have `properties` or `rules` fields. It SHALL NOT have an `add()` method. The constructor SHALL accept only `string` as the selector type (not `ElementBuilder`).

#### Scenario: Rule construction preserves raw contents
- **WHEN** `new Rule(".foo", [new Property("color", "red"), new Rule(".bar", [new Property("font-size", "12px")])])` is called
- **THEN** `rule.contents` SHALL contain exactly the Property and nested Rule in order

### Requirement: AtRule stores raw contents
The `AtRule` class SHALL have fields `keyword: string`, `rule: string | null`, and `contents: Content[]`. It SHALL NOT have a `properties` field. It SHALL NOT have an `add()` method.

#### Scenario: AtRule construction preserves raw contents
- **WHEN** `new AtRule("media", "(min-width: 600px)", [new Rule(".foo", [new Property("color", "red")])])` is called
- **THEN** `atRule.contents` SHALL contain exactly the Rule

### Requirement: CssClass node type
A `CssClass` class SHALL exist with a single field `name: string`. It SHALL be constructable via `new CssClass(name)`.

#### Scenario: CssClass construction
- **WHEN** `new CssClass("active")` is called
- **THEN** `cssClass.name` SHALL equal `"active"`

### Requirement: Attr node type
An `Attr` class SHALL exist with fields `name: string` and `value: Content`. It SHALL be constructable via `new Attr(name, value)`.

#### Scenario: Attr construction
- **WHEN** `new Attr("href", "/home")` is called
- **THEN** `attr.name` SHALL equal `"href"` and `attr.value` SHALL equal `"/home"`

### Requirement: Property unchanged
The `Property` class SHALL retain its current shape: `name: string` and `value: Content`.

#### Scenario: Property construction
- **WHEN** `new Property("color", "red")` is called
- **THEN** `property.name` SHALL equal `"color"` and `property.value` SHALL equal `"red"`

### Requirement: Raw unchanged
The `Raw` class SHALL retain its current shape: `text: string`, constructed from any `Content` value coerced to string.

#### Scenario: Raw construction
- **WHEN** `new Raw("<!-- comment -->")` is called
- **THEN** `raw.text` SHALL equal `"<!-- comment -->"`

### Requirement: No factories or ElementBuilder
The `factories/` directory and `ElementBuilder` type SHALL be deleted. The `@hypeup/vdom` package SHALL export no Proxy-backed constructors.

#### Scenario: Package exports
- **WHEN** the `@hypeup/vdom` package is imported
- **THEN** it SHALL export `Element`, `Rule`, `AtRule`, `Property`, `Raw`, `CssClass`, `Attr` and no other runtime values

### Requirement: Flat directory layout
All node class files SHALL live directly under `vdom/src/`, not in a `nodes/` subdirectory. The `factories/` subdirectory SHALL not exist.

#### Scenario: File structure
- **WHEN** listing `vdom/src/`
- **THEN** it SHALL contain `Element.ts`, `Rule.ts`, `AtRule.ts`, `Property.ts`, `Raw.ts`, `CssClass.ts`, `Attr.ts`, and `index.ts` at the top level with no `nodes/` or `factories/` subdirectories
