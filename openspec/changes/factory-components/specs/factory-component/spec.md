## ADDED Requirements

### Requirement: Factory component returns a view function
A factory component SHALL be a PascalCase function that returns a **function** (the view) instead of an Element. The outer factory runs once per mount to establish closure state. The returned view function runs on every redraw to produce fresh vdom.

#### Scenario: Factory component with local state
- **WHEN** a component `Counter(initial)` is defined that declares `let count = initial` and returns `() => div(span(count), button(on("click", () => { count++; redraw() }), "+"))`
- **THEN** `count` SHALL persist across redraws and incrementing it SHALL cause the view to reflect the new value on the next redraw

#### Scenario: Factory component renders initial view
- **WHEN** a factory component is mounted for the first time
- **THEN** the factory function SHALL be called once with its args, and the returned view function SHALL be called once to produce the initial vdom

#### Scenario: Multiple instances have independent state
- **WHEN** two instances of the same factory component are mounted (e.g., `Counter(0)` and `Counter(10)`)
- **THEN** each instance SHALL have its own independent closure state

### Requirement: Factory detection uses typeof check
The runtime SHALL detect factory components by checking `typeof result === "function"` after calling `lazy.fn(...args)`. If the result is a function, it SHALL be treated as a factory view function. If the result is any other type (Element, string, etc.), it SHALL be treated as vdom using existing behavior.

#### Scenario: Function return detected as factory
- **WHEN** `lazy.fn(...args)` returns a function
- **THEN** the runtime SHALL treat it as a factory and store the returned function as the view

#### Scenario: Element return uses existing behavior
- **WHEN** `lazy.fn(...args)` returns an Element
- **THEN** the runtime SHALL mount/diff it using existing Lazy behavior with no factory handling

### Requirement: Factory re-invoked when args change
When a factory component's args change (determined by shallow `===` comparison), the factory SHALL be re-invoked with the new args, producing a new view function. The old closure state is discarded.

#### Scenario: Args change causes factory re-initialization
- **WHEN** a factory component was mounted with `args: [itemA]` and a redraw produces a Lazy node with the same `fn` but `args: [itemB]` where `itemA !== itemB`
- **THEN** the factory SHALL be called again with `[itemB]`, producing a new view function with fresh closure state
- **AND** the new view function SHALL be called and the result diffed against the previous DOM

#### Scenario: Args unchanged calls view only
- **WHEN** a factory component was mounted with `args: [item]` and a redraw produces a Lazy node with the same `fn` and `args: [item]` where the reference is `===`
- **THEN** the factory SHALL NOT be re-invoked
- **AND** the stored view function SHALL be called and the result diffed against the previous DOM

### Requirement: Factory disposed on function change
When the `fn` reference on a Lazy node changes between renders, the previous factory's mount handle SHALL be disposed and the new function SHALL be mounted fresh.

#### Scenario: Different function replaces factory
- **WHEN** the previous Lazy had `fn: CounterA` (a factory) and the new Lazy has `fn: CounterB`
- **THEN** the previous MountHandle SHALL be disposed and `CounterB` SHALL be mounted fresh
