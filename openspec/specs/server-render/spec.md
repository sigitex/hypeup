## ADDED Requirements

### Requirement: render() handles Each nodes
When `render()` encounters an `Each` vdom node, it SHALL iterate the items array, call the map function for each item, and render the resulting `Element` to HTML. No keying or reconciliation logic SHALL be applied server-side — the `Each` node is treated as a simple loop.

#### Scenario: Each node rendered to HTML
- **WHEN** `render(ul(each([{id: 1, name: "a"}, {id: 2, name: "b"}], i => i.id, i => li(i.name))))` is called
- **THEN** the output SHALL be `<ul><li>a</li><li>b</li></ul>`

#### Scenario: Empty Each node
- **WHEN** `render(ul(each([], i => i.id, i => li(i.name))))` is called
- **THEN** the output SHALL be `<ul></ul>` (no child elements)

#### Scenario: Each node with two-argument overload
- **WHEN** `render(ul(each(["a", "b", "c"], i => li(i))))` is called
- **THEN** the output SHALL be `<ul><li>a</li><li>b</li><li>c</li></ul>`

#### Scenario: Each node among other children
- **WHEN** `render(div(h1("Title"), each(items, i => i.id, i => p(i.text))))` is called
- **THEN** the `h1` SHALL render first, followed by one `p` per item, all inside the `div`

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
