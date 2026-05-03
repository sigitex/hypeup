## MODIFIED Requirements

### Requirement: Ambient declarations for escape-hatch globals
`src/primitives.ts` SHALL contain `declare global` declarations for all escape-hatch globals, alongside its re-export of `primitives.gen.ts`. The `on` function SHALL use overloads to provide strongly-typed event inference from `GlobalEventHandlersEventMap`, with a `string` fallback for custom events.

#### Scenario: on function declaration (known events)
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `on` SHALL be available as a global function with generic overload: `on<K extends keyof GlobalEventHandlersEventMap>(event: K, handler: (e: GlobalEventHandlersEventMap[K]) => void): EventBinding`
- **AND** the handler parameter type SHALL be inferred from the event name (e.g., `on("click", (e) => ...)` infers `e: MouseEvent`)

#### Scenario: on function declaration (custom events)
- **WHEN** a consumer calls `on` with an event name not in `GlobalEventHandlersEventMap`
- **THEN** the fallback overload SHALL accept `(event: string, handler: (e: Event) => void): EventBinding`
- **AND** the handler parameter SHALL be typed as `Event`

#### Scenario: No manual type annotations needed
- **WHEN** a consumer writes `on("keydown", (e) => e.key)`
- **THEN** TypeScript SHALL infer `e` as `KeyboardEvent` without explicit annotation
- **AND** `e.key` SHALL type-check successfully
