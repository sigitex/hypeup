## Why

The hypeup CLI currently accepts all configuration through command-line flags (`--dir`, `--out`, `--clean`, `--port`). There is no way to persist project-level defaults, pass configuration through to Vite, or extend behavior without modifying CLI flags each invocation. A config file (`hypeup.config.ts`) follows the established convention of Vite, Astro, and similar tools, giving users a persistent, type-safe place to configure their project.

## What Changes

- Add config file loading to the CLI — resolve and import `hypeup.config.ts` (or `.js`, `.mjs`) from the project root at startup
- The config file exports a default object (or function returning one) with typed options: `dir`, `out`, `clean`, `port`, and a `vite` key for Vite config passthrough
- CLI flags override config file values (flags take precedence)
- The `vite` key is merged into the Vite config used by both `buildPages` and `createDevServer`
- Provide a `defineConfig` helper for type-safe authoring

## Capabilities

### New Capabilities
- `config-file`: Loading, resolving, and merging a project config file (`hypeup.config.ts`) with CLI flags and Vite configuration

### Modified Capabilities
- `cli-arg-parsing`: CLI flag resolution now falls back to config file values when flags are not provided
- `generate-command`: Generate command reads config before executing, passes merged Vite config to build/dev

## Impact

- `packages/cli/src/config.ts` — new module for config loading and types
- `packages/cli/src/generate.ts` — reads config, merges with flags
- `packages/cli/src/vite.ts` — accepts and merges user Vite config
- `packages/cli/src/cli.ts` — may surface config errors
- No breaking changes — config file is optional, all existing flag-only usage continues to work
