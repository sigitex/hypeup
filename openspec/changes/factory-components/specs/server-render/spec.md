## MODIFIED Requirements

### Requirement: render() handles Lazy nodes
When `render()` encounters a `Lazy` vdom node, it SHALL call `lazy.fn(...args)` to resolve it. If the result is a **function** (factory component), it SHALL call the function once to produce the Element. The resulting Element (or other vdom content) SHALL be rendered to HTML via the standard `renderNode` path.

#### Scenario: Pure Lazy node rendered to HTML
- **WHEN** `renderNode` encounters a `Lazy` node whose `fn(...args)` returns an Element `div("hello")`
- **THEN** the output SHALL include `<div>hello</div>`

#### Scenario: Factory Lazy node rendered to HTML
- **WHEN** `renderNode` encounters a `Lazy` node whose `fn(...args)` returns a function, and calling that function returns `div("hello")`
- **THEN** the output SHALL include `<div>hello</div>`

#### Scenario: Factory state is not preserved in SSR
- **WHEN** a factory component with closure state is rendered server-side
- **THEN** the factory SHALL be called once, the view SHALL be called once, and no state caching SHALL occur
