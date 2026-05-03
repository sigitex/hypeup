## Why

hypeup needs an objective performance comparison against established frameworks (React, Solid, Vue, Svelte, etc.). The js-framework-benchmark (https://github.com/krausest/js-framework-benchmark) is the industry-standard suite for this, measuring DOM operations on large tables (create/replace/update/swap/remove/clear 1,000-10,000 rows). Submitting a hypeup implementation validates the `each()` + reconciler work and provides measurable data for optimization. This change depends on the `list-reconciliation` change being implemented first.

## What Changes

- Clone the js-framework-benchmark repo to `/sig/hypeup-bench` and create the hypeup implementation directly at `frameworks/keyed/hypeup/` within it
- Implement the benchmark app: a table with 1,000-10,000 rows supporting create, replace, partial update, select, swap, remove, append, and clear operations
- Use hypeup idiomatically: `each()` with keyed reconciliation for the row list, `reactive()` for state, the DSL for markup, Vite + `@hypeup/plugin` for the build
- Conform to the benchmark's required HTML structure (Bootstrap classes, specific button IDs, correct `<tr>` structure with `aria-hidden` attributes)
- Include `package.json` with `js-framework-benchmark` metadata and `build-prod` script

## Capabilities

### New Capabilities
- `benchmark-app`: The benchmark implementation — data store, row rendering, event handling, selection state, conforming to js-framework-benchmark's required structure and operations
- `benchmark-build`: Build configuration (Vite + hypeup plugin) producing a production bundle, with `package.json` metadata for the benchmark harness

### Modified Capabilities
None — this is a standalone application that consumes existing hypeup packages without modifying them.

## Impact

- **Repo**: Clone of `krausest/js-framework-benchmark` at `/sig/hypeup-bench`
- **New files**: `frameworks/keyed/hypeup/` containing `index.html`, `src/main.ts`, `src/store.ts`, `vite.config.ts`, `package.json`
- **Modified files**: None outside the `frameworks/keyed/hypeup/` directory
- **Dependencies**: `@hypeup/client`, `@hypeup/vdom`, `@hypeup/plugin` (linked from workspace), `vite` (dev)
- **Prerequisites**: `list-reconciliation` change (already implemented)
- **External**: PR-ready for submission to `krausest/js-framework-benchmark`
