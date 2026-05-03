## ADDED Requirements

### Requirement: effect runs a function and tracks reactive reads
`effect(fn)` SHALL immediately execute `fn`. During execution, any reactive property reads (via `reactive()` proxies) SHALL be recorded as dependencies. When any dependency changes, `fn` SHALL re-execute.

#### Scenario: Effect runs immediately
- **WHEN** `effect(() => { /* body */ })` is called
- **THEN** the body SHALL execute once synchronously

#### Scenario: Effect re-runs on dependency change
- **WHEN** `const state = reactive({ x: 1 }); effect(() => console.log(state.x))` is created and then `state.x = 2` is assigned
- **THEN** the effect SHALL re-run logging `2`

#### Scenario: Effect only re-runs for read dependencies
- **WHEN** an effect reads `state.x` but not `state.y`, and `state.y = 99` is assigned
- **THEN** the effect SHALL NOT re-run

### Requirement: effect returns a dispose function
`effect(fn)` SHALL return a function that, when called, unsubscribes the effect from all its dependencies. After disposal, changing dependencies SHALL NOT re-run the effect.

#### Scenario: Disposed effect stops updating
- **WHEN** `const dispose = effect(() => console.log(state.x)); dispose()` is called, then `state.x = 2`
- **THEN** the effect SHALL NOT re-run

### Requirement: effect cleans up old dependencies on re-run
When an effect re-executes, it SHALL re-track dependencies from the new execution. Dependencies from the previous execution that are no longer read SHALL be unsubscribed.

#### Scenario: Conditional dependency change
- **WHEN** an effect reads `state.x ? state.a : state.b` and `state.x` changes from `true` to `false`
- **THEN** the effect SHALL unsubscribe from `state.a` and subscribe to `state.b`

### Requirement: computed creates a cached derived value
`computed(fn)` SHALL return a value that lazily evaluates `fn` and caches the result. It SHALL re-evaluate only when its dependencies change. Reading a computed inside an effect SHALL track it as a dependency.

#### Scenario: Computed derives from reactive state
- **WHEN** `const state = reactive({ x: 1 }); const doubled = computed(() => state.x * 2)` is created
- **THEN** reading `doubled` SHALL return `2`

#### Scenario: Computed updates when dependency changes
- **WHEN** `state.x = 5` is assigned
- **THEN** reading `doubled` SHALL return `10`

#### Scenario: Computed caches until dependency changes
- **WHEN** `doubled` is read multiple times without changing `state.x`
- **THEN** `fn` SHALL NOT be re-invoked

#### Scenario: Computed tracked inside effects
- **WHEN** an effect reads a computed value and the computed's underlying dependency changes
- **THEN** the effect SHALL re-run

### Requirement: batch defers effect execution
`batch(fn)` SHALL execute `fn` synchronously. Reactive property assignments inside `fn` SHALL NOT trigger effects until `fn` returns. After `fn` completes, all pending effects SHALL execute once.

#### Scenario: Batched writes trigger single effect run
- **WHEN** `batch(() => { state.a = 1; state.b = 2 })` is called and an effect reads both `state.a` and `state.b`
- **THEN** the effect SHALL re-run exactly once after the batch, not twice
