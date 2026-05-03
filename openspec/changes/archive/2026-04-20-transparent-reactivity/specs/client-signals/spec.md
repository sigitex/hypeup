## MODIFIED Requirements

### Requirement: signal creates a reactive value
`signal(initialValue)` SHALL remain available for backward compatibility. It SHALL return a reactive box with a `.value` property for reading and writing. Changes to `.value` SHALL notify all subscribers. New code SHOULD prefer `reactive()` for object state.

#### Scenario: Read initial value
- **WHEN** `const s = signal("hello")` is created
- **THEN** `s.value` SHALL be `"hello"`

#### Scenario: Write updates value
- **WHEN** `s.value = "world"` is assigned
- **THEN** `s.value` SHALL be `"world"` and all subscribers SHALL be notified

#### Scenario: Subscribe to changes
- **WHEN** a subscriber is registered on a signal and the value changes
- **THEN** the subscriber callback SHALL be invoked with the new value

### Requirement: computed creates a derived signal
`computed(fn)` SHALL return a read-only derived value. It SHALL cache the result until any reactive dependency read inside `fn` changes. `computed()` SHALL work with both `reactive()` proxy reads and `signal()` `.value` reads.

#### Scenario: Computed derives from reactive state
- **WHEN** `const state = reactive({ x: 1 }); const doubled = computed(() => state.x * 2)` is created
- **THEN** reading `doubled` SHALL return `2`

#### Scenario: Computed updates when reactive dependency changes
- **WHEN** `state.x = 5` is assigned
- **THEN** reading `doubled` SHALL return `10`

#### Scenario: Computed still works with signals
- **WHEN** `const name = signal("bob"); const upper = computed(() => name.value.toUpperCase())` is created
- **THEN** `upper` SHALL return `"BOB"` and update when `name.value` changes

#### Scenario: Computed caches until dependency changes
- **WHEN** a computed is read multiple times without changing its dependencies
- **THEN** `fn` SHALL NOT be re-invoked

### Requirement: isSignal type guard
`isSignal(value)` SHALL return `true` if the value is a signal (or computed), `false` otherwise. This is used by the mount system for backward-compatible signal passthrough.

#### Scenario: Signal detected
- **WHEN** `isSignal(signal("x"))` is called
- **THEN** it SHALL return `true`

#### Scenario: Non-signal not detected
- **WHEN** `isSignal("hello")` is called
- **THEN** it SHALL return `false`

#### Scenario: Reactive object not detected as signal
- **WHEN** `isSignal(reactive({ x: 1 }))` is called
- **THEN** it SHALL return `false`

## ADDED Requirements

### Requirement: reactive exported from @hypeup/client
`@hypeup/client` SHALL export `reactive` as the primary state creation primitive. It SHALL also export `effect` and `batch` for advanced use cases.

#### Scenario: Client exports reactive primitives
- **WHEN** a user imports from `@hypeup/client`
- **THEN** `reactive`, `effect`, `batch`, `computed`, `signal`, and `isSignal` SHALL all be available
