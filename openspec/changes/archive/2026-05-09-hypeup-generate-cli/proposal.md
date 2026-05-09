## Why

The `hypeup` CLI package (`packages/cli`) is currently a stub with no functionality. Hypeup has a working server-side renderer (`@hypeup/render`) that converts vdom to HTML strings, but there is no way to use it for static site generation (SSG) from the command line. A `generate` subcommand would let users build static HTML files from hypeup components, enabling deployment to any static hosting without a runtime server.

## What Changes

- Add a `generate` subcommand to the `hypeup` CLI that performs static site generation
- The subcommand discovers page components from a conventional directory structure (e.g., `pages/`)
- Each page component is loaded via Vite's `ssrLoadModule` (which applies the hypeup Babel transform), rendered to HTML using `@hypeup/render`, and written to an output directory
- Support `--watch` mode that re-generates pages when source files change
- Support configuration for input directory and output directory
- Add argument parsing infrastructure to the CLI (replacing the current stub)
- Wire up Vite, `@hypeup/plugin`, and `@hypeup/render` as dependencies of the CLI package

## Capabilities

### New Capabilities
- `cli-arg-parsing`: CLI entry point with subcommand routing and argument parsing
- `generate-command`: The `generate` subcommand that orchestrates SSG — discovers pages, renders them, writes output files
- `page-discovery`: Convention-based discovery of page components from a source directory, mapping file paths to output routes

### Modified Capabilities

## Impact

- `packages/cli/` — complete rewrite from stub to functional CLI with `generate` subcommand
- `packages/cli/package.json` — new dependencies on `vite`, `@hypeup/plugin`, `@hypeup/render`, `@hypeup/runtime`, `@hypeup/lexicon`
- Build output — CLI must be executable via `npx hypeup generate` or as a direct binary
- No breaking changes to existing packages; this is additive
