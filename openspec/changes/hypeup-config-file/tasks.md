## 1. Config Types and defineConfig

- [ ] 1.1 Define `HypeupConfig` type in `packages/cli/src/config.ts` — `dir`, `out`, `clean`, `port` (all optional), plus `vite` key accepting Vite `UserConfig`
- [ ] 1.2 Implement `defineConfig` identity function with proper type signature (accepts object or function returning object)
- [ ] 1.3 Export `defineConfig` and `HypeupConfig` from `packages/cli/src/index.ts`

## 2. Config File Resolution

- [ ] 2.1 Implement `loadConfig` function in `packages/cli/src/config.ts` — searches for `hypeup.config.ts`, `.js`, `.mjs` in project root
- [ ] 2.2 Handle function vs object default export (call function if default export is a function)
- [ ] 2.3 Handle missing config file gracefully (return empty config)
- [ ] 2.4 Handle invalid default export (print error, exit code 1)

## 3. Config Merging

- [ ] 3.1 Implement `mergeConfig` function — merges defaults, config file values, and CLI flags (flags win)
- [ ] 3.2 Update `generate` function in `generate.ts` to call `loadConfig` and `mergeConfig` before proceeding
- [ ] 3.3 Pass resolved `dir`, `out`, `clean`, `port` values through the generate pipeline

## 4. Vite Config Passthrough

- [ ] 4.1 Update `buildPages` in `vite.ts` to accept and merge user Vite config
- [ ] 4.2 Update `createDevServer` in `vite.ts` to accept and merge user Vite config
- [ ] 4.3 Ensure hypeup essentials (plugin, SSR externals) are applied after user config merge and cannot be overridden

## 5. Tests

- [ ] 5.1 Write tests for `defineConfig` (object, function)
- [ ] 5.2 Write tests for `loadConfig` (ts file, js file, missing file, invalid export)
- [ ] 5.3 Write tests for config merging (flag override, config fallback, defaults)
- [ ] 5.4 Write integration test — create a fixture with `hypeup.config.ts`, run generate, verify config is applied
- [ ] 5.5 Write integration test — verify Vite config passthrough (e.g., resolve alias)
