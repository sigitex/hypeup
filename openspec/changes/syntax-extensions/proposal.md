## Why

Third-party libraries and project-level configs need a way to register custom symbols that the babel plugin transforms like native DSL primitives — without importing them. This enables utility libraries (e.g., shorthand CSS aliases, design-token constants) that feel native to the hypeup DSL. Without this, every shorthand requires a manual import or a wrapper function, breaking the "no imports for DSL primitives" design constraint.

## What Changes

- The babel plugin accepts an `extensions` option: an array of `HypeupExtension` objects, each providing **aliases** and/or **constants**.
- **Aliases** map a short identifier to an existing primitive (e.g., `fs` -> `fontSize`). The alias gets the exact same transform behavior as the target.
- **Constants** map a bare identifier to a fixed `prop(name, value)` expansion (e.g., `m4` -> `prop("margin", "4px")`). Constants are bare-identifier-only — they are not callable.
- The `HypeupExtension` type is exported from `@hypeup/babel` for extension authors.
- The unplugin passes `extensions` through to the babel plugin and includes extension symbols in the pre-scan identifier set.
- Invalid alias targets (referencing a primitive that doesn't exist) throw at plugin init time.
- Symbol collisions (two extensions or an extension and a built-in defining the same name) throw at plugin init time. Overwrites are not supported because conflicting `declare global` types are not viable in TypeScript.

## Capabilities

### New Capabilities
- `syntax-extensions`: Extension point for user-provided aliases and constants in the babel plugin

### Modified Capabilities
- `primitive-table`: The primitive table accepts external entries from extensions (aliases and constants) merged at init time
- `babel-plugin`: The plugin accepts an `extensions` option and handles the new `constant` primitive kind
- `unplugin-wrapper`: The unplugin plumbs `extensions` through to the babel plugin and pre-scan

## Impact

- `packages/babel/src/buildDslPrimitives.ts` — new `ConstantPrimitive` type, `HypeupExtension` type, extension merging logic
- `packages/babel/src/hypeupBabelPlugin.ts` — accepts options, new `handleConstant()` handler
- `packages/babel/src/index.ts` — re-export `HypeupExtension`
- `packages/plugin/src/unplugin.ts` — extended `HypeupPluginOptions`, plumbing
- `packages/babel/tests/plugin.test.ts` — new test groups for aliases, constants, collisions, scope shadowing
- No runtime changes. No breaking changes. Extensions are opt-in via plugin config.
