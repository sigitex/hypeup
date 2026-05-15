## Context

The hypeup CLI (`packages/cli`) currently takes all options via CLI flags. Configuration like output directory, scan directory, and dev server port must be passed on every invocation. There is no way to pass Vite configuration (plugins, resolve aliases, etc.) to the underlying Vite build/dev server. The CLI uses Vite internally for both SSR builds and the dev server, so users need a way to customize that Vite config.

## Goals / Non-Goals

**Goals:**
- Provide a `hypeup.config.ts` file convention for persistent project configuration
- Support `.ts`, `.js`, `.mjs`, and `.json` config file extensions
- Allow Vite config passthrough via a `vite` key
- CLI flags override config file values
- Provide a `defineConfig` helper exported from the `hypeup` package for type safety

**Non-Goals:**
- Plugin system or lifecycle hooks in the config (future work)
- Config file generation or scaffolding CLI command
- Environment-specific config overrides (dev vs prod)

## Decisions

### 1. Config file resolution: Bun import with conventional filenames

**Rationale:** Check for config files in order: `hypeup.config.ts`, `hypeup.config.js`, `hypeup.config.mjs` in the project root. Import the first one found using dynamic `import()`. Bun handles `.ts` natively so no compilation step is needed. This matches Vite's own config resolution pattern.

**Alternative considered:** Using Vite's `loadConfigFromFile` — rejected because it adds complexity and we only need a simple import. Bun handles TypeScript directly.

### 2. Static config format: JSON

**Rationale:** In addition to `.ts`, `.js`, and `.mjs`, support a static JSON config file: `hypeup.config.json`. JSON supports simple project defaults without requiring a script config. Static formats only support the flat hypeup options (`dir`, `out`, `clean`, `port`). The `vite` key is **not supported** in static formats because Vite config requires JavaScript values (plugin instances, functions, regexes). If a static config includes a `vite` key, it is ignored.

Resolution order becomes: `hypeup.config.ts`, `.js`, `.mjs`, `.json` — first found wins. Script formats are checked first since they are strictly more capable.

**Alternative considered:** Supporting YAML and TOML — deferred to keep the initial config surface smaller.

### 3. Config shape: flat object with `vite` key for passthrough

**Rationale:** The config object mirrors CLI flags at the top level (`dir`, `out`, `clean`, `port`) with a `vite` key for raw Vite `UserConfig` passthrough. This keeps the common case simple while giving full Vite control when needed.

```ts
import { defineConfig } from "hypeup"

export default defineConfig({
  dir: "src",
  out: "dist",
  vite: {
    resolve: {
      alias: { "@": "./src" }
    }
  }
})
```

**Alternative considered:** Nested config structure with `build`, `dev`, `server` sections — rejected because the CLI surface is small enough that flat keys are clearer. The `vite` key handles all Vite-specific needs.

### 4. Merge strategy: CLI flags > config file > defaults

**Rationale:** Three-layer precedence: built-in defaults are the base, config file overrides defaults, CLI flags override everything. This is the standard pattern (Vite, ESLint, Prettier all do this). For the `vite` key, the user's Vite config is deep-merged with the CLI's internal Vite config, with the user's values winning on conflict. The CLI's essentials (hypeup plugin, SSR externals) are always applied and cannot be overridden.

### 5. `defineConfig` helper: identity function with type narrowing

**Rationale:** `defineConfig` is a pass-through function that exists solely for TypeScript autocompletion. It accepts a `HypeupConfig` object (or a function returning one) and returns it unchanged. Exported from the main `hypeup` package so users write `import { defineConfig } from "hypeup"`. This matches Vite's `defineConfig` pattern exactly.

### 6. Config supports function export for dynamic config

**Rationale:** The default export can be an object or a function returning an object. The function receives no arguments for now (environment/mode can be added later). This allows dynamic config without overcomplicating the initial implementation.

## Risks / Trade-offs

- **[Bun-only config loading]** → Importing `.ts` config files directly only works in Bun. Mitigation: hypeup already requires Bun, so this is not a new constraint.
- **[Vite config merge conflicts]** → User's Vite config could conflict with hypeup's required config (e.g., overriding the hypeup plugin or SSR externals). Mitigation: hypeup's essential config is applied after the merge, so critical settings cannot be overridden. Document which Vite keys are managed by hypeup.
- **[No config validation]** → Invalid config values (wrong types, unknown keys) won't be caught at load time. Mitigation: TypeScript types catch most issues at authoring time via `defineConfig`. Runtime validation can be added later if needed.
