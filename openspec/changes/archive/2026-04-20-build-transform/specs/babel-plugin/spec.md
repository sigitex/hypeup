## ADDED Requirements

### Requirement: Scope-aware identifier rewriting
The Babel plugin SHALL visit all `Identifier` references and skip any identifier that has a binding in an enclosing scope (`path.scope.getBinding(name)` non-null). It SHALL also skip identifiers in non-reference positions (object-literal property names, import specifiers, etc.).

#### Scenario: Locally bound name not rewritten
- **WHEN** source contains `const div = something(); div("hello")`
- **THEN** the `div` call SHALL NOT be rewritten

#### Scenario: Destructured name not rewritten
- **WHEN** source contains `const { color } = palette; color("red")`
- **THEN** the `color` call SHALL NOT be rewritten

#### Scenario: Parameter name not rewritten
- **WHEN** source contains `function render(div) { return div("hi") }`
- **THEN** the `div` call SHALL NOT be rewritten

### Requirement: HTML element lowering
The plugin SHALL rewrite HTML element calls to `elem()` or `elemVoid()` based on the tag's void-ness from the primitive table.

#### Scenario: Standard element call
- **WHEN** source contains `div("hello")`
- **THEN** output SHALL be `elem("div", ["hello"])`

#### Scenario: Void element call
- **WHEN** source contains `br()`
- **THEN** output SHALL be `elemVoid("br", [])`

#### Scenario: Void element with attributes
- **WHEN** source contains `img({ src: "x.png" })`
- **THEN** output SHALL be `elemVoid("img", [{ src: "x.png" }])`

### Requirement: Class chain lowering
The plugin SHALL rewrite member-expression chains on HTML elements into `elem()` calls with one `className()` per chain segment. Each class name SHALL be kebabized (camelCase to kebab-case).

#### Scenario: Single class
- **WHEN** source contains `div.active("hello")`
- **THEN** output SHALL be `elem("div", [className("active"), "hello"])`

#### Scenario: Multiple classes
- **WHEN** source contains `div.active.large("hello")`
- **THEN** output SHALL be `elem("div", [className("active"), className("large"), "hello"])`

#### Scenario: CamelCase class kebabized
- **WHEN** source contains `div.activeItem("hello")`
- **THEN** output SHALL be `elem("div", [className("active-item"), "hello"])`

### Requirement: CSS property call-form lowering
The plugin SHALL rewrite CSS property calls to `prop()` with the kebabized CSS name.

#### Scenario: Simple property call
- **WHEN** source contains `color("red")`
- **THEN** output SHALL be `prop("color", "red")`

#### Scenario: CamelCase property call
- **WHEN** source contains `zIndex(10)`
- **THEN** output SHALL be `prop("z-index", 10)`

### Requirement: CSS property keyword-access lowering
The plugin SHALL rewrite CSS property member access to `prop()` with both name and keyword kebabized.

#### Scenario: Keyword access
- **WHEN** source contains `zIndex.auto`
- **THEN** output SHALL be `prop("z-index", "auto")`

#### Scenario: CamelCase keyword
- **WHEN** source contains `writingMode.horizontalTb`
- **THEN** output SHALL be `prop("writing-mode", "horizontal-tb")`

#### Scenario: Color keyword access
- **WHEN** source contains `color.red`
- **THEN** output SHALL be `prop("color", "red")`

### Requirement: At-rule lowering
The plugin SHALL rewrite at-rule calls to `atRule()` with the keyword from the primitive table. If the first argument is a string literal, it SHALL be hoisted to the rule slot.

#### Scenario: At-rule with rule argument
- **WHEN** source contains `$media("(min-width: 600px)", rule(".foo", color.red))`
- **THEN** output SHALL be `atRule("@media", "(min-width: 600px)", [rule(".foo", [prop("color", "red")])])`

#### Scenario: At-rule without rule argument
- **WHEN** source contains `$fontFace(fontFamily("Arial"))`
- **THEN** output SHALL be `atRule("@font-face", null, [prop("font-family", "Arial")])`

### Requirement: Rule lowering
The plugin SHALL rewrite `rule` calls and class-access forms.

#### Scenario: Rule call with string selector
- **WHEN** source contains `rule(".foo", color.red)`
- **THEN** output SHALL be `rule(".foo", [prop("color", "red")])`

#### Scenario: Rule class access
- **WHEN** source contains `rule.active(color.red)`
- **THEN** output SHALL be `rule(".active", [prop("color", "red")])`

#### Scenario: Rule class access kebabized
- **WHEN** source contains `rule.activeItem(color.red)`
- **THEN** output SHALL be `rule(".active-item", [prop("color", "red")])`

#### Scenario: Rule with element selector
- **WHEN** source contains `rule(div, color.red)`
- **THEN** output SHALL be `rule("div", [prop("color", "red")])`

### Requirement: Escape hatch lowering
The plugin SHALL rewrite escape-hatch identifiers to imports from `@hypeup/runtime`.

#### Scenario: elem escape hatch
- **WHEN** source contains `elem(tag, "hello")`
- **THEN** output SHALL import `elem` from `@hypeup/runtime` and produce `elem(tag, ["hello"])`

#### Scenario: doctype.html5
- **WHEN** source contains `doctype.html5`
- **THEN** output SHALL be `raw("<!DOCTYPE html>")`

#### Scenario: cssString passthrough
- **WHEN** source contains `cssString(userInput)`
- **THEN** output SHALL import `cssString` from `@hypeup/runtime` and preserve the call

### Requirement: Import injection is minimal and idempotent
The plugin SHALL only insert imports for helpers actually used in the file. Multiple uses of the same helper SHALL result in a single import.

#### Scenario: Only used helpers imported
- **WHEN** a file uses `div` and `color` but not `rule`
- **THEN** only `elem`, `prop`, and `className` (if class chains present) SHALL be imported from `@hypeup/runtime`

#### Scenario: Fresh identifier on collision
- **WHEN** user code has a local binding named `elem` and the transformer also needs to import `elem`
- **THEN** the imported `elem` SHALL use a fresh identifier (e.g., `_elem`) to avoid collision
