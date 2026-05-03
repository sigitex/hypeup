## ADDED Requirements

### Requirement: CSS gen imports from @hypeup/runtime
The generated `css.gen.ts` SHALL use `import type` from `@hypeup/runtime` for `Property` and `AtRule` types. It SHALL NOT import from `@hypeup/vdom`.

#### Scenario: Import statement uses runtime
- **WHEN** `css.gen.ts` is inspected
- **THEN** the import statement SHALL reference `@hypeup/runtime`, not `@hypeup/vdom`

### Requirement: CSS property declarations as ambient globals
The generated `css.gen.ts` SHALL declare CSS properties as ambient globals in a `declare global` block. Each property SHALL be a callable that accepts `(value: Content): Property`, with keyword sub-properties that return `Property` directly.

#### Scenario: Property with keywords
- **WHEN** `css.gen.ts` is inspected
- **THEN** a property like `color` SHALL be declared as a callable `(value: Content): Property` with keyword members like `color.red: Property`

#### Scenario: Property without keywords
- **WHEN** `css.gen.ts` is inspected
- **THEN** a property like `zIndex` SHALL be declared as a callable `(value: Content): Property`

### Requirement: CSS at-rule declarations as ambient globals
The generated `css.gen.ts` SHALL declare at-rules as ambient global functions (e.g., `$media`, `$keyframes`) that return `AtRule`.

#### Scenario: At-rule declaration
- **WHEN** `css.gen.ts` is inspected
- **THEN** `$media` SHALL be declared as a function returning `AtRule`
