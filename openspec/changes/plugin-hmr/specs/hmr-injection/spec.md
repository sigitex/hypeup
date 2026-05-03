## ADDED Requirements

### Requirement: Export rewriting for function declarations
In dev mode, the plugin SHALL rewrite exported function declarations in project files to use the proxy registry. `export function Foo() { ... }` SHALL become a plain function declaration followed by a registry call and re-export: `function Foo() { ... }; const __hmr_Foo = register(id, Foo); export { __hmr_Foo as Foo }`.

#### Scenario: Named export function is rewritten
- **WHEN** a project file contains `export function App() { return section(...) }`
- **AND** the plugin is running in dev mode
- **THEN** the output SHALL contain a plain `function App()` declaration
- **AND** a `register()` call wrapping `App` with a module-unique identifier
- **AND** an `export { ... as App }` re-export of the registered proxy

#### Scenario: Non-exported functions are not rewritten
- **WHEN** a project file contains `function helper() { ... }` (not exported)
- **THEN** the function SHALL NOT be wrapped with a registry call

#### Scenario: Production mode skips rewriting
- **WHEN** the plugin is running in production mode
- **THEN** no export rewriting SHALL occur

### Requirement: HMR accept callback injection
In dev mode, the plugin SHALL append an `import.meta.hot.accept()` block to project files that contain DSL primitives. The accept callback SHALL call `triggerRedraw()` from `@hypeup/plugin/hmr-runtime`.

#### Scenario: Accept block injected in dev mode
- **WHEN** a project file is transformed in dev mode
- **THEN** the output SHALL include `import.meta.hot.accept(...)` that triggers a redraw

#### Scenario: Accept block not injected in production
- **WHEN** a project file is transformed in production mode
- **THEN** the output SHALL NOT include any `import.meta.hot` references

### Requirement: Project file gating
HMR injection SHALL only apply to files within the consumer project directory (determined by `process.cwd()`). Files from workspace-linked framework packages SHALL NOT receive HMR injection.

#### Scenario: Framework package file excluded
- **WHEN** a file from `../hypeup/packages/vdom/src/Rule.ts` is transformed
- **AND** the consumer project cwd is `/sig/sigitex.com`
- **THEN** no HMR code SHALL be injected into that file

#### Scenario: Project file included
- **WHEN** a file at `/sig/sigitex.com/app/App.ts` is transformed
- **AND** the consumer project cwd is `/sig/sigitex.com`
- **THEN** HMR code SHALL be injected

### Requirement: Babel plugin integration
The export rewriting SHALL be implemented as a Babel plugin added to the existing `transformAsync` call's `plugins` array. It SHALL NOT require a separate parse/transform pass.

#### Scenario: Single transform pass
- **WHEN** a file is transformed with HMR enabled
- **THEN** both the DSL transform and the export rewriting SHALL occur in a single `transformAsync` call
