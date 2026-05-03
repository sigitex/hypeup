## MODIFIED Requirements

### Requirement: No-op short-circuit
The plugin SHALL perform a cheap string scan for known primitive identifiers before invoking Babel. If no primitives are found, the file SHALL be skipped entirely. In dev mode, the HMR Babel plugin and accept callback SHALL also be skipped for files without primitives.

#### Scenario: File without DSL references skipped
- **WHEN** a `.ts` file contains no DSL identifiers (no `div`, `color`, `rule`, etc.)
- **THEN** Babel SHALL NOT be invoked for that file
- **AND** no HMR code SHALL be injected

## ADDED Requirements

### Requirement: Dev mode detection
The plugin SHALL detect whether it is running in development or production mode. In dev mode, HMR code injection SHALL be enabled. In production mode, the transform SHALL behave identically to the current implementation (DSL transform only, no HMR).

#### Scenario: Dev mode enables HMR
- **WHEN** `process.env.NODE_ENV` is not `"production"`
- **THEN** the transform SHALL include the HMR Babel plugin and accept callback for project files

#### Scenario: Production mode disables HMR
- **WHEN** `process.env.NODE_ENV` is `"production"`
- **THEN** the transform SHALL NOT include any HMR-related code
