## MODIFIED Requirements

### Requirement: Generate command renders pages to static HTML files
The `generate` subcommand SHALL load the project config file (if present), merge config values with CLI flags, then discover page components, render each to HTML using `@hypeup/render`, and write the output files to the output directory. The merged Vite configuration SHALL be passed to both `vite.build()` and the dev server.

#### Scenario: Basic generation
- **WHEN** the user runs `hypeup generate` with `*.page.ts` files in the project
- **THEN** the CLI SHALL write corresponding `.html` files to the output directory with the rendered content

#### Scenario: Config file provides defaults
- **WHEN** the user has a `hypeup.config.ts` with `{ dir: "src", out: "build" }` and runs `hypeup generate`
- **THEN** the CLI SHALL scan `src` for pages and write output to `build/`

#### Scenario: Vite config passthrough in build
- **WHEN** the config file includes `{ vite: { resolve: { alias: { "@": "./src" } } } }`
- **THEN** the SSR build SHALL resolve `@/` imports using the provided alias

#### Scenario: Vite config passthrough in dev server
- **WHEN** the config file includes Vite config and the user runs `hypeup generate --watch`
- **THEN** the dev server SHALL use the merged Vite configuration
