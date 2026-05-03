## Why

Saving a file during development causes a full page reload instead of a hot module replacement (HMR) update. The `@hypeup/plugin` Vite plugin only transforms DSL code via Babel but has no HMR support. This makes the dev feedback loop slow and destroys client-side state on every edit.

## What Changes

- Add a component proxy registry as a dev-only runtime helper in `@hypeup/plugin` (exported from `@hypeup/plugin/hmr-runtime`), so component function references remain stable across hot updates while delegating to the latest version.
- Modify the unplugin transform to inject HMR code in dev mode: wrap exported functions with registry proxies, add `import.meta.hot.accept()` calls, and trigger `redraw()` on accept.
- The plugin must detect dev vs prod mode and only inject HMR code during development. In production builds, no HMR code is emitted.

## Capabilities

### New Capabilities

- `hmr-runtime`: Dev-only proxy registry that wraps component exports in stable proxy functions. On HMR update, the registry is updated with new function implementations while proxies held by `mount()` continue to delegate to the latest version.
- `hmr-injection`: Plugin transform logic that detects exported functions in project files, rewrites them to use the proxy registry, and injects `import.meta.hot.accept()` with a `redraw()` callback. Only active in dev mode.

### Modified Capabilities

- `unplugin-wrapper`: The transform method gains dev-mode detection and conditional HMR code injection after the Babel pass.

## Impact

- `@hypeup/plugin`: New export path `@hypeup/plugin/hmr-runtime`, modified `unplugin.ts` transform.
- `@hypeup/plugin/package.json`: New export entry for `./hmr-runtime`.
- Consumer projects: No changes required. HMR works automatically for any file containing hypeup DSL primitives.
- `@hypeup/client`: No changes. The existing `redraw()` export is imported dynamically in the HMR accept callback.
