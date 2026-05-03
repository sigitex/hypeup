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
