## ADDED Requirements

### Requirement: EventBinding vdom node type
`@hypeup/vdom` SHALL export an `EventBinding` class that stores an event name (string) and a handler (function). It SHALL be constructable and usable as an element content argument.

#### Scenario: Create an EventBinding
- **WHEN** `new EventBinding("click", handler)` is called
- **THEN** the resulting object has `event: "click"` and `handler` properties

### Requirement: on() helper function
`@hypeup/client` SHALL export an `on(event, handler)` function that returns an `EventBinding` instance. This is the public API for attaching DOM events within the DSL.

#### Scenario: Create event binding via helper
- **WHEN** `on("click", myHandler)` is called
- **THEN** it returns an `EventBinding` with event `"click"` and handler `myHandler`

### Requirement: Classify EventBinding
The client classifier SHALL recognize `EventBinding` instances via `instanceof` and classify them as `{ kind: "event", event: string, handler: Function }`.

#### Scenario: Classification dispatch
- **WHEN** `classify(new EventBinding("click", fn))` is called
- **THEN** it returns `{ kind: "event", event: "click", handler: fn }`

### Requirement: Apply event binding to DOM element
The client apply function SHALL handle `kind: "event"` by calling `element.addEventListener(event, handler)`. The returned undo closure SHALL call `element.removeEventListener(event, handler)`.

#### Scenario: Attach and detach event listener
- **WHEN** an EventBinding for "click" is applied to an element
- **THEN** `addEventListener("click", handler)` is called on the element
- **WHEN** the undo closure is called
- **THEN** `removeEventListener("click", handler)` is called on the element

### Requirement: Reactive event binding via signals
Event bindings SHALL work with signals. A `signal(on("click", handlerA))` SHALL subscribe reactively — when the signal value changes to `on("click", handlerB)`, the old listener SHALL be removed and the new one attached.

#### Scenario: Swap event handler via signal
- **WHEN** a signal containing `on("click", handlerA)` is updated to `on("click", handlerB)`
- **THEN** `handlerA` is removed via `removeEventListener` and `handlerB` is attached via `addEventListener`

### Requirement: Server-side renderer ignores EventBinding
The server-side renderer (`@hypeup/runtime` classifier) SHALL skip `EventBinding` nodes during HTML generation. Event bindings are client-only and SHALL NOT produce any HTML output.

#### Scenario: Render element with event binding
- **WHEN** an element with an `EventBinding` content argument is rendered server-side
- **THEN** the event binding is ignored and the rendered HTML contains no trace of it
