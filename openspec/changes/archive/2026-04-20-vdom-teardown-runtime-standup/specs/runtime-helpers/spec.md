## ADDED Requirements

### Requirement: elem helper
The `elem` function SHALL accept `(tag: string, contents: Content[])` and return `new Element(tag, false, contents)`.

#### Scenario: elem creates non-void element
- **WHEN** `elem("div", ["hello"])` is called
- **THEN** the result SHALL be an `Element` with `tag === "div"`, `isVoid === false`, and `contents` equal to `["hello"]`

### Requirement: elemVoid helper
The `elemVoid` function SHALL accept `(tag: string, contents: Content[])` and return `new Element(tag, true, contents)`.

#### Scenario: elemVoid creates void element
- **WHEN** `elemVoid("br", [])` is called
- **THEN** the result SHALL be an `Element` with `tag === "br"`, `isVoid === true`, and `contents` equal to `[]`

### Requirement: prop helper
The `prop` function SHALL accept `(name: string, value: Content)` and return `new Property(name, value)`.

#### Scenario: prop creates property
- **WHEN** `prop("color", "red")` is called
- **THEN** the result SHALL be a `Property` with `name === "color"` and `value === "red"`

### Requirement: attr helper
The `attr` function SHALL accept `(name: string, value: Content)` and return `new Attr(name, value)`.

#### Scenario: attr creates attribute node
- **WHEN** `attr("href", "/home")` is called
- **THEN** the result SHALL be an `Attr` with `name === "href"` and `value === "/home"`

### Requirement: raw helper
The `raw` function SHALL accept `(content: Content)` and return `new Raw(content)`.

#### Scenario: raw creates raw node
- **WHEN** `raw("<!-- comment -->")` is called
- **THEN** the result SHALL be a `Raw` with `text === "<!-- comment -->"`

### Requirement: rule helper
The `rule` function SHALL accept `(selector: string, contents: Content[])` and return `new Rule(selector, contents)`.

#### Scenario: rule creates rule node
- **WHEN** `rule(".foo", [prop("color", "red")])` is called
- **THEN** the result SHALL be a `Rule` with `selector === ".foo"` and `contents` containing the Property

### Requirement: atRule helper
The `atRule` function SHALL accept `(keyword: string, rule: string | null, contents: Content[])` and return `new AtRule(keyword, rule, contents)`.

#### Scenario: atRule creates at-rule node
- **WHEN** `atRule("media", "(min-width: 600px)", [rule(".foo", [prop("color", "red")])])` is called
- **THEN** the result SHALL be an `AtRule` with `keyword === "media"`, `rule === "(min-width: 600px)"`, and `contents` containing the Rule

#### Scenario: atRule with null rule
- **WHEN** `atRule("font-face", null, [prop("font-family", "Arial")])` is called
- **THEN** the result SHALL be an `AtRule` with `keyword === "font-face"`, `rule === null`, and `contents` containing the Property

### Requirement: className helper
The `className` function SHALL accept `(name: string)` and return `new CssClass(name)`.

#### Scenario: className creates class node
- **WHEN** `className("active")` is called
- **THEN** the result SHALL be a `CssClass` with `name === "active"`

### Requirement: cssString helper
The `cssString` function SHALL accept a string and return it escaped for safe use in CSS string contexts using `cssesc`.

#### Scenario: cssString escapes special characters
- **WHEN** `cssString("hello \"world\"")` is called
- **THEN** the result SHALL be a properly CSS-escaped string

### Requirement: Runtime package structure
All helpers SHALL be exported from `@hypeup/runtime`. The package SHALL also re-export all node classes from `@hypeup/vdom`. The `cssesc` dependency SHALL be owned by this package, not by `@hypeup/vdom`.

#### Scenario: Package exports
- **WHEN** `@hypeup/runtime` is imported
- **THEN** it SHALL export `elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `atRule`, `className`, `cssString`, and all node classes (`Element`, `Property`, `AtRule`, `Rule`, `Raw`, `CssClass`, `Attr`)
