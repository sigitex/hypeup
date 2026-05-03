## ADDED Requirements

### Requirement: signal creates a reactive value
`signal(initialValue)` SHALL return a reactive box with a `.value` property for reading and writing. Changes to `.value` SHALL notify all subscribers.

#### Scenario: Read initial value
- **WHEN** `const s = signal("hello")` is created
- **THEN** `s.value` SHALL be "hello"

#### Scenario: Write updates value
- **WHEN** `s.value = "world"` is assigned
- **THEN** `s.value` SHALL be "world" and all subscribers SHALL be notified

#### Scenario: Subscribe to changes
- **WHEN** a subscriber is registered on a signal and the value changes
- **THEN** the subscriber callback SHALL be invoked with the new value

### Requirement: computed creates a derived signal
`computed(fn)` SHALL return a read-only signal whose value is the result of `fn()`. It SHALL cache the result until any signal read inside `fn` changes.

#### Scenario: Computed derives from signal
- **WHEN** `const name = signal("bob"); const upper = computed(() => name.value.toUpperCase())` is created
- **THEN** `upper.value` SHALL be "BOB"

#### Scenario: Computed updates when dependency changes
- **WHEN** `name.value = "jane"` is assigned
- **THEN** `upper.value` SHALL be "JANE"

#### Scenario: Computed caches until dependency changes
- **WHEN** `upper.value` is read multiple times without changing `name`
- **THEN** `fn` SHALL NOT be re-invoked

### Requirement: isSignal type guard
`isSignal(value)` SHALL return `true` if the value is a signal (or computed), `false` otherwise. This is used by the classification path.

#### Scenario: Signal detected
- **WHEN** `isSignal(signal("x"))` is called
- **THEN** it SHALL return `true`

#### Scenario: Non-signal not detected
- **WHEN** `isSignal("hello")` is called
- **THEN** it SHALL return `false`

#### Scenario: Computed detected as signal
- **WHEN** `isSignal(computed(() => 1))` is called
- **THEN** it SHALL return `true`
