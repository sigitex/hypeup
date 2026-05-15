## ADDED Requirements

### Requirement: Config file is resolved from project root
The CLI SHALL look for a config file in the project root in the following order: `hypeup.config.ts`, `hypeup.config.js`, `hypeup.config.mjs`, `hypeup.config.json`. The first file found SHALL be loaded. If no config file exists, the CLI SHALL proceed with defaults.

#### Scenario: TypeScript config file exists
- **WHEN** the project root contains `hypeup.config.ts`
- **THEN** the CLI SHALL import and use it as the project configuration

#### Scenario: JavaScript config file exists
- **WHEN** the project root contains `hypeup.config.js` but no `hypeup.config.ts`
- **THEN** the CLI SHALL import and use it as the project configuration

#### Scenario: JSON config file exists
- **WHEN** the project root contains `hypeup.config.json` but no `.ts`, `.js`, or `.mjs` config file
- **THEN** the CLI SHALL parse and use it as the project configuration

#### Scenario: No config file exists
- **WHEN** the project root contains no config file
- **THEN** the CLI SHALL proceed using built-in defaults

### Requirement: Config file exports a default configuration object
The config file SHALL export a default value that is either a `HypeupConfig` object or a function returning a `HypeupConfig` object.

#### Scenario: Object export
- **WHEN** the config file default-exports an object with `{ out: "build" }`
- **THEN** the CLI SHALL use `"build"` as the output directory

#### Scenario: Function export
- **WHEN** the config file default-exports a function returning `{ out: "build" }`
- **THEN** the CLI SHALL call the function and use `"build"` as the output directory

#### Scenario: Invalid default export
- **WHEN** the config file default-exports a non-object, non-function value
- **THEN** the CLI SHALL print an error message and exit with code 1

### Requirement: Static JSON config supports only flat hypeup options
Static JSON config SHALL only support the flat hypeup options (`dir`, `out`, `clean`, `port`). The `vite` key SHALL be ignored if present in a static config file.

#### Scenario: JSON config with vite key
- **WHEN** `hypeup.config.json` contains `{ "dir": "src", "vite": { "resolve": {} } }`
- **THEN** the CLI SHALL use `"src"` as the scan directory and SHALL ignore the `vite` key

### Requirement: Config supports hypeup options
The config object SHALL accept the following optional keys: `dir` (string), `out` (string), `clean` (boolean), `port` (number).

#### Scenario: Dir option in config
- **WHEN** the config file specifies `{ dir: "src" }` and no `--dir` flag is passed
- **THEN** the CLI SHALL scan for pages in the `src` directory

#### Scenario: Out option in config
- **WHEN** the config file specifies `{ out: "build" }` and no `--out` flag is passed
- **THEN** the CLI SHALL write output to the `build` directory

#### Scenario: Port option in config
- **WHEN** the config file specifies `{ port: 3000 }` and `--watch` is passed without `--port`
- **THEN** the dev server SHALL listen on port 3000

### Requirement: Config supports Vite passthrough
The config object SHALL accept an optional `vite` key containing a Vite `UserConfig` object. The Vite config SHALL be merged into the CLI's internal Vite configuration.

#### Scenario: Vite resolve aliases
- **WHEN** the config file specifies `{ vite: { resolve: { alias: { "@": "./src" } } } }`
- **THEN** the Vite build and dev server SHALL resolve `@/` imports to `./src/`

#### Scenario: Vite plugins
- **WHEN** the config file specifies additional Vite plugins via `{ vite: { plugins: [...] } }`
- **THEN** the Vite build and dev server SHALL include those plugins alongside the hypeup plugin

### Requirement: CLI flags override config file values
When both a CLI flag and a config file value are provided for the same option, the CLI flag SHALL take precedence.

#### Scenario: Flag overrides config
- **WHEN** the config file specifies `{ out: "build" }` and the user runs `hypeup generate --out dist`
- **THEN** the CLI SHALL use `"dist"` as the output directory

#### Scenario: Config used when flag absent
- **WHEN** the config file specifies `{ out: "build" }` and the user runs `hypeup generate` without `--out`
- **THEN** the CLI SHALL use `"build"` as the output directory

### Requirement: defineConfig helper provides type safety
The `hypeup` package SHALL export a `defineConfig` function that accepts a `HypeupConfig` object or a function returning one, and returns it unchanged.

#### Scenario: defineConfig with object
- **WHEN** a user writes `export default defineConfig({ out: "build" })`
- **THEN** the config SHALL be equivalent to `export default { out: "build" }`

#### Scenario: defineConfig with function
- **WHEN** a user writes `export default defineConfig(() => ({ out: "build" }))`
- **THEN** the config SHALL be equivalent to `export default () => ({ out: "build" })`
