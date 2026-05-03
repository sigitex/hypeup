## ADDED Requirements

### Requirement: Proxy registry maintains stable function references
The HMR runtime SHALL maintain a registry mapping string identifiers to function implementations. When `register(id, fn)` is called, it SHALL store `fn` as the current implementation for `id` and return a stable proxy function. The proxy SHALL always delegate to the latest registered implementation for that `id`.

#### Scenario: First registration creates proxy
- **WHEN** `register("mod:App", appFn)` is called for the first time
- **THEN** it SHALL return a proxy function that calls `appFn` when invoked

#### Scenario: Re-registration updates implementation behind existing proxy
- **WHEN** `register("mod:App", appFn)` was previously called and returned `proxy`
- **AND** `register("mod:App", newAppFn)` is called again
- **THEN** the second call SHALL return the same `proxy` reference
- **AND** invoking `proxy()` SHALL now call `newAppFn`, not `appFn`

#### Scenario: Proxy forwards arguments and this-context
- **WHEN** a proxy is invoked with arguments and a this-context
- **THEN** it SHALL forward both to the current registered function via `fn.apply(this, arguments)`

### Requirement: Trigger redraw after HMR update
The HMR runtime SHALL export a `triggerRedraw()` function that calls the redraw function from `@hypeup/client`. This SHALL be used in HMR accept callbacks to re-render the component tree with updated function implementations.

#### Scenario: triggerRedraw calls client redraw
- **WHEN** `triggerRedraw()` is called
- **THEN** it SHALL dynamically import `@hypeup/client` and call its `redraw()` export

### Requirement: Export from @hypeup/plugin/hmr-runtime
The HMR runtime SHALL be exported from the subpath `@hypeup/plugin/hmr-runtime`. It SHALL NOT be part of the main `@hypeup/plugin` export.

#### Scenario: Import from subpath
- **WHEN** a module imports `{ register } from "@hypeup/plugin/hmr-runtime"`
- **THEN** the import SHALL resolve to the registry module
