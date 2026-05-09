## 1. CLI Setup

- [x] 1.1 Add dependencies to `packages/cli/package.json`: `vite`, `@hypeup/plugin`, `@hypeup/render`, `@hypeup/runtime`, `@hypeup/lexicon`, `@hypeup/vdom`
- [x] 1.2 Add `bin` field to `packages/cli/package.json` pointing to the CLI entry point
- [x] 1.3 Run `bun install` to link workspace dependencies

## 2. Argument Parsing

- [x] 2.1 Implement `parseArgs` function in `packages/cli/src/args.ts` — parses `Bun.argv` into subcommand + flags (supports `--flag value`, `--flag=value`, and boolean flags)
- [x] 2.2 Implement subcommand routing in `packages/cli/src/index.ts` — replaces stub, dispatches to subcommand handlers
- [x] 2.3 Implement `--version` flag support (reads version from package.json)
- [x] 2.4 Implement usage summary output when no subcommand or unknown subcommand is provided
- [x] 2.5 Write tests for argument parsing (space-separated values, equals-separated values, boolean flags, unknown flags)

## 3. Page Discovery

- [x] 3.1 Implement `discoverPages` function in `packages/cli/src/discover.ts` — globs `**/*.{ts,tsx}` from the pages directory
- [x] 3.2 Implement exclusion of `_`-prefixed and `.`-prefixed files
- [x] 3.3 Implement `mapRoute` function — maps file paths to output HTML paths (strip extension, append `.html`)
- [x] 3.4 Implement pages directory validation (exists, is directory)
- [x] 3.5 Write tests for page discovery (flat, nested, exclusions, route mapping, missing directory)

## 4. Vite Integration

- [x] 4.1 Implement shared Vite config builder in `packages/cli/src/vite.ts` — returns base Vite config with `@hypeup/plugin/vite` pre-configured, user's project root, suppressed Vite logging
- [x] 4.2 Implement `buildPages` function — calls `vite.build()` in SSR mode with discovered pages as entry points, returns path to compiled output
- [x] 4.3 Implement `createDevServer` function — creates Vite dev server in middleware mode for watch mode (no HTTP listener)

## 5. Generate Command (one-shot, `vite.build()`)

- [x] 5.1 Implement `generate` command handler in `packages/cli/src/generate.ts` — orchestrates discovery, build, rendering, and output
- [x] 5.2 Implement SSR build step — call `buildPages` with discovered page entry points, producing compiled JS modules in a temp/build directory
- [x] 5.3 Implement page rendering — import compiled modules, call default exports to get vdom, pass through `@hypeup/render` to produce HTML strings
- [x] 5.4 Implement file output — create output directories and write `.html` files with `Bun.write`
- [x] 5.5 Implement `--clean` flag — remove output directory before generating
- [x] 5.6 Implement `--pages` and `--out` flag handling with defaults
- [x] 5.7 Implement result summary output (page count, output directory, duration)
- [x] 5.8 Implement error handling — catch build/render failures, print file path and error to stderr, exit code 1

## 6. Watch Mode (`ssrLoadModule`)

- [x] 6.1 Implement `--watch` flag handling — when set, use Vite dev server instead of `vite.build()`
- [x] 6.2 Implement watch-mode rendering — load pages via `vite.ssrLoadModule()`, call default exports, render, write HTML
- [x] 6.3 Copy `public/` directory to output directory on initial generate and on changes
- [x] 6.4 Subscribe to Vite's watcher for changes in the pages directory
- [x] 6.5 On file change, invalidate Vite's module graph for changed modules, re-discover pages, and re-generate all output
- [x] 6.6 Implement debouncing — coalesce rapid file changes into a single re-generate
- [x] 6.7 Print re-generation summary on each watch cycle (changed file, page count, duration)
- [x] 6.8 Handle graceful shutdown on SIGINT/SIGTERM — close Vite server and exit

## 7. Integration & Verification

- [x] 7.1 Create a test fixture with sample page files (flat and nested) and a `public/` dir with a static asset
- [x] 7.2 Write integration test for one-shot generate — run `hypeup generate` against fixtures, verify output HTML files and static assets
- [x] 7.3 Write integration test for watch mode — start `hypeup generate --watch`, modify a fixture file, verify re-generation
- [x] 7.4 Verify CLI is executable via `bun run packages/cli/src/index.ts generate`
- [x] 7.5 Run `bun check` (tsgo) to verify type correctness
