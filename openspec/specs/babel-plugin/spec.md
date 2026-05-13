## Requirements

### Requirement: Babel plugin rewrites global DSL identifiers
The babel plugin SHALL rewrite unbound global identifiers to namespaced imports. In addition to existing transforms, the plugin SHALL detect PascalCase function calls with at least one argument and wrap them in `lazy(fn, [...args])`. This wrapping SHALL occur regardless of where the call appears (element children, variable assignments, return statements, etc.).

#### Scenario: PascalCase call with args is wrapped
- **WHEN** the source contains `TodoRow(todo, isSelected)` where `TodoRow` is PascalCase and has arguments
- **THEN** the output SHALL contain `lazy(TodoRow, [todo, isSelected])` with `lazy` imported from `@hypeup/client`

#### Scenario: PascalCase call with single arg
- **WHEN** the source contains `Header(count)`
- **THEN** the output SHALL contain `lazy(Header, [count])`

#### Scenario: Zero-arg PascalCase call is NOT wrapped
- **WHEN** the source contains `Header()`
- **THEN** the output SHALL contain `Header()` unchanged — zero-arg calls are NOT wrapped

#### Scenario: Lowercase function call is NOT wrapped
- **WHEN** the source contains `helper(x)` where `helper` is lowercase
- **THEN** the call SHALL NOT be wrapped in `lazy`

#### Scenario: Known JS built-in is NOT wrapped
- **WHEN** the source contains `String(value)` or `Date(x)` or any known built-in constructor
- **THEN** the call SHALL NOT be wrapped in `lazy`

#### Scenario: PascalCase call in variable assignment is wrapped
- **WHEN** the source contains `const row = TodoRow(todo)`
- **THEN** the output SHALL contain `const row = lazy(TodoRow, [todo])`

#### Scenario: PascalCase call inside each() mapFn is wrapped
- **WHEN** the source contains `each(items, keyFn, d => TodoRow(d, state.selected === d.id))`
- **THEN** the `TodoRow(d, state.selected === d.id)` call SHALL be wrapped as `lazy(TodoRow, [d, state.selected === d.id])`

#### Scenario: PascalCase call with new keyword is NOT wrapped
- **WHEN** the source contains `new Element("div", false, [])`
- **THEN** the `new` expression SHALL NOT be wrapped in `lazy`

### Requirement: HTML element lowering
The plugin SHALL rewrite HTML element calls to `elem()` or `elemVoid()` based on the tag's void-ness from the primitive table. Each user-provided argument SHALL be wrapped in an arrow function thunk `() => expr` for deferred evaluation. `className()` calls generated from class chains SHALL NOT be wrapped.

#### Scenario: Standard element call
- **WHEN** source contains `div("hello")`
- **THEN** output SHALL be `elem("div", [() => "hello"])`

#### Scenario: Void element call
- **WHEN** source contains `br()`
- **THEN** output SHALL be `elemVoid("br", [])`

#### Scenario: Void element with attributes
- **WHEN** source contains `img({ src: "x.png" })`
- **THEN** output SHALL be `elemVoid("img", [() => ({ src: "x.png" })])`

#### Scenario: Element with multiple arguments
- **WHEN** source contains `div("hello", myVar, { id: "main" })`
- **THEN** output SHALL be `elem("div", [() => "hello", () => myVar, () => ({ id: "main" })])`

### Requirement: Class chain lowering
The plugin SHALL rewrite member-expression chains on HTML elements into `elem()` calls with one `className()` per chain segment. Each class name SHALL be kebabized (camelCase to kebab-case). `className()` calls SHALL NOT be wrapped in thunks. User-provided arguments SHALL be wrapped.

#### Scenario: Single class
- **WHEN** source contains `div.active("hello")`
- **THEN** output SHALL be `elem("div", [className("active"), () => "hello"])`

#### Scenario: Multiple classes
- **WHEN** source contains `div.active.large("hello")`
- **THEN** output SHALL be `elem("div", [className("active"), className("large"), () => "hello"])`

#### Scenario: CamelCase class kebabized
- **WHEN** source contains `div.activeItem("hello")`
- **THEN** output SHALL be `elem("div", [className("active-item"), () => "hello"])`

### Requirement: each() global recognition
The babel plugin SHALL recognize `each` as a DSL global identifier (similar to `on`, `reactive`, `signal`). When `each(...)` is encountered as a free global reference (not a local binding), it SHALL be rewritten to an import from `@hypeup/client`.

#### Scenario: each call rewritten to import
- **WHEN** source contains `each(state.items, i => i.id, i => li(i.name))`
- **THEN** output SHALL import `each` from `@hypeup/client` and preserve the call as `each(state.items, i => i.id, i => li(i.name))`

#### Scenario: each arguments not thunk-wrapped
- **WHEN** source contains `each(state.items, i => i.id, i => li(i.name))`
- **THEN** the arguments to `each()` SHALL NOT be wrapped in thunks — they are passed as-is (the key function and map function are already functions)

#### Scenario: each with local binding not rewritten
- **WHEN** source contains `const each = myFn; each(items)`
- **THEN** the `each` call SHALL NOT be rewritten (it is a local binding, not the DSL global)

#### Scenario: each inside element contents
- **WHEN** source contains `ul(each(state.items, i => i.id, i => li(i.name)))`
- **THEN** the `each(...)` call inside `ul()` SHALL be rewritten to the imported `each`, and the outer `ul()` SHALL be processed normally with the `each(...)` result wrapped in a thunk as a standard argument

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
