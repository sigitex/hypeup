## ADDED Requirements

### Requirement: Bundler-specific subpath exports
`@hypeup/plugin` SHALL provide subpath exports for each supported bundler: `@hypeup/plugin/vite`, `@hypeup/plugin/esbuild`, `@hypeup/plugin/rollup`, `@hypeup/plugin/webpack`, `@hypeup/plugin/rspack`.

#### Scenario: Vite integration
- **WHEN** a Vite config imports `{ hypeup } from "@hypeup/plugin/vite"`
- **THEN** it SHALL return a valid Vite plugin that transforms DSL source files

#### Scenario: Bun via esbuild adapter
- **WHEN** a Bun build config uses `{ hypeup } from "@hypeup/plugin/esbuild"`
- **THEN** it SHALL work with `Bun.build({ plugins })` since Bun's plugin API is esbuild-compatible

### Requirement: File filter
The plugin SHALL filter files by default to `/\.[jt]sx?$/` and exclude `node_modules`. Users SHALL be able to override the filter to include workspace packages.

#### Scenario: Default filter processes TS files
- **WHEN** a `.ts` file passes through the plugin
- **THEN** it SHALL be transformed

#### Scenario: Default filter skips node_modules
- **WHEN** a file under `node_modules/` passes through the plugin
- **THEN** it SHALL NOT be transformed

### Requirement: No-op short-circuit
The plugin SHALL perform a cheap string scan for known primitive identifiers before invoking Babel. If no primitives are found, the file SHALL be skipped entirely.

#### Scenario: File without DSL references skipped
- **WHEN** a `.ts` file contains no DSL identifiers (no `div`, `color`, `rule`, etc.)
- **THEN** Babel SHALL NOT be invoked for that file

### Requirement: Consumer project gate
The plugin SHALL check for `@hypeup/lexicon` in the consumer's `package.json` at init. If absent, the transformer SHALL be inert — all files pass through unmodified.

#### Scenario: No lexicon dependency
- **WHEN** the consumer's `package.json` does not list `@hypeup/lexicon` in any dependency field
- **THEN** the plugin SHALL not transform any files

### Requirement: Source maps forwarded
The plugin SHALL pass `sourceMaps: true` to Babel and forward the generated source map in the transform result.

#### Scenario: Source map generated
- **WHEN** a file is transformed
- **THEN** the result SHALL include a valid source map

### Requirement: Sensible parser defaults
The plugin SHALL ship with `@babel/preset-typescript` and JSX syntax support so `.ts` / `.tsx` files work without user configuration.

#### Scenario: TypeScript file parsed
- **WHEN** a `.ts` file with type annotations is transformed
- **THEN** it SHALL be parsed and transformed without errors
