## ADDED Requirements

### Requirement: npm build-prod script
The `package.json` SHALL include a `build-prod` script that produces a production build. The build output SHALL be loadable by the benchmark's HTTP server.

#### Scenario: Build succeeds
- **WHEN** `npm run build-prod` is executed in the benchmark directory
- **THEN** the build SHALL complete without errors and produce output files

#### Scenario: Built app serves correctly
- **WHEN** the benchmark HTTP server is started and the built app is opened at `http://localhost:8080/frameworks/keyed/hypeup/`
- **THEN** the page SHALL load and display the benchmark UI with all action buttons functional

### Requirement: package.json benchmark metadata
The `package.json` SHALL include the `js-framework-benchmark` metadata object with framework version, home URL, and language fields.

#### Scenario: Metadata present
- **WHEN** the benchmark harness reads the `package.json`
- **THEN** it SHALL find a `js-framework-benchmark` object with `frameworkVersionFromPackage` pointing to the hypeup client package name, `frameworkHomeURL` set to the hypeup repository URL, and `language` set to `"TypeScript"`

### Requirement: npm ci installs dependencies
The benchmark directory SHALL support `npm ci` for reproducible dependency installation with a lockfile.

#### Scenario: Clean install succeeds
- **WHEN** `npm ci` is executed in the benchmark directory
- **THEN** all dependencies SHALL be installed without errors

### Requirement: Vite production build
The build SHALL use Vite with `@hypeup/plugin` to transform the hypeup DSL and produce a minified production bundle.

#### Scenario: Vite build produces dist
- **WHEN** `npm run build-prod` is executed
- **THEN** the build SHALL produce output in a location that `index.html` references (either inline or via `dist/`)
- **AND** the output SHALL NOT contain `.gz` files (the benchmark server prefers gzipped files when present, which can serve stale builds)
