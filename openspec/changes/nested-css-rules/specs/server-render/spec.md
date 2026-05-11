## ADDED Requirements

### Requirement: Slash-prefixed child rules render as native CSS nesting
When `renderRule` encounters a child rule whose selector starts with `/`, the renderer SHALL strip the `/` prefix and emit the child rule **inline** inside the parent rule's braces, producing native CSS nesting output. The existing SCSS-style flattening SHALL NOT apply to `/`-prefixed rules.

#### Scenario: Simple nested class selector
- **WHEN** `render(rule(".parent", [prop("color", "red"), rule("/.child", [prop("color", "blue")])]))` is called
- **THEN** the output SHALL be `.parent{color:red;.child{color:blue}}`

#### Scenario: Nested pseudo-class
- **WHEN** `render(rule(".btn", [prop("color", "black"), rule("/&:hover", [prop("color", "red")])]))` is called
- **THEN** the output SHALL be `.btn{color:black;&:hover{color:red}}`

#### Scenario: Nested child combinator
- **WHEN** `render(rule(".list", [prop("margin", "0"), rule("/> li", [prop("padding", "4px")])]))` is called
- **THEN** the output SHALL be `.list{margin:0;> li{padding:4px}}`

#### Scenario: Non-slash child rule still flattens
- **WHEN** `render(rule(".parent", [prop("color", "red"), rule(".child", [prop("color", "blue")])]))` is called
- **THEN** the output SHALL be `.parent{color:red}.parent .child{color:blue}` (existing behavior unchanged)

#### Scenario: Mixed slash and non-slash children
- **WHEN** a parent rule contains both `/`-prefixed and non-prefixed child rules
- **THEN** `/`-prefixed rules SHALL render inline inside the parent braces and non-prefixed rules SHALL flatten as separate top-level rules

#### Scenario: Deeply nested slash rules
- **WHEN** `render(rule(".a", [rule("/.b", [rule("/.c", [prop("color", "red")])])]))` is called
- **THEN** the output SHALL be `.a{.b{.c{color:red}}}`
