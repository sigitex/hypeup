## 1. Config Types and defineConfig

- [x] 1.1 Define `HypeupConfig` type in `packages/cli/src/config.ts` — `dir`, `out`, `clean`, `port` (all optional), plus `vite` key accepting Vite `UserConfig`
- [x] 1.2 Implement `defineConfig` identity function with proper type signature (accepts object or function returning object)
- [x] 1.3 Export `defineConfig` and `HypeupConfig` from `packages/cli/src/index.ts`

## 2. Config File Resolution

- [x] 2.1 Implement `loadConfig` function in `packages/cli/src/config.ts` — searches for `hypeup.config.ts`, `.js`, `.mjs`, `.json` in project root
- [x] 2.2 Handle script formats (`.ts`, `.js`, `.mjs`) via dynamic `import()` — support function vs object default export
- [x] 2.3 Handle static JSON via `JSON.parse` — strip any `vite` key from the result
- [x] 2.4 Handle missing config file gracefully (return empty config)
- [x] 2.5 Handle invalid default export or parse errors (print error, exit code 1)

## 3. Config Merging

- [x] 3.1 Implement `mergeConfig` function — merges defaults, config file values, and CLI flags (flags win)
- [x] 3.2 Update `generate` function in `generate.ts` to call `loadConfig` and `mergeConfig` before proceeding
- [x] 3.3 Pass resolved `dir`, `out`, `clean`, `port` values through the generate pipeline

## 4. Vite Config Passthrough

- [x] 4.1 Update `buildPages` in `vite.ts` to accept and merge user Vite config
- [x] 4.2 Update `createDevServer` in `vite.ts` to accept and merge user Vite config
- [x] 4.3 Ensure hypeup essentials (plugin, SSR externals) are applied after user config merge and cannot be overridden

## 5. Tests

- [x] 5.1 Write tests for `defineConfig` (object, function)
- [x] 5.2 Write tests for `loadConfig` (ts file, js file, json file, missing file, invalid export, static format ignores vite key)
- [x] 5.3 Write tests for config merging (flag override, config fallback, defaults)
- [x] 5.4 Write integration test — create a fixture with `hypeup.config.ts`, run generate, verify config is applied
- [x] 5.5 Write integration test — verify Vite config passthrough (e.g., resolve alias)

## 6. Documentation

- [x] 6.1 Add a "Configuration File" section to `README.md` (near the CLI/SSG docs) documenting `hypeup.config.ts`, `defineConfig`, supported formats, and Vite config passthrough
