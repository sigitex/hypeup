## Why

Third-party libraries and project-level configs need a way to register custom symbols that the babel plugin transforms like native DSL primitives — without importing them. This enables utility libraries (e.g., shorthand CSS aliases, design-token constants, component-like element shorthands) that feel native to the hypeup DSL. Without this, every shorthand requires a manual import or a wrapper function, breaking the "no imports for DSL primitives" design constraint.

## What Changes

- The babel plugin accepts an `extensions` option: an array of `HypeupExtension` objects. Each extension is a flat `Record<string, ExtensionSymbol>` where keys are identifier names (possibly dotted, e.g., `"container.sm"`) and values are a discriminated union by `type`.
- **`"alias"`** — maps a short identifier to an existing primitive or extension-defined symbol (e.g., `fs` -> `fontSize`). The alias gets the exact same transform behavior as the target. Aliases can target other extension-defined symbols if processed in array order.
- **`"prop"`** — bare identifier expands to a fixed `prop(css, value)` call (e.g., `m4` -> `prop("margin", "4px")`). Not callable.
- **`"className"`** — bare identifier expands to a fixed `className(value)` call (e.g., `active` -> `className("active")`). Not callable.
- **`"element"`** — identifier expands to an `elem(tag, [...prebakedChildren, ...userChildren])` call with optional prebaked className, props, and attrs. Supports dot-segment class chaining like HTML elements. Void inferred from tag.
- **Dotted-path keys** (e.g., `"m4.x"`, `"container.sm"`) are first-class table entries. Lookup uses longest-match-first, falling back to root-match-plus-segments. Unlimited depth. No root entry required.
- The `HypeupExtension` and `ExtensionSymbol` types are exported from `@hypeup/babel` for extension authors.
- The unplugin passes `extensions` through to the babel plugin and includes extension root identifiers in the pre-scan set.
- Invalid alias targets throw at plugin init time.
- Symbol collisions (two extensions or an extension and a built-in defining the same key) throw at plugin init time.

## Capabilities

### New Capabilities
- `syntax-extensions`: Extension point for user-provided symbols in the babel plugin (aliases, prop constants, className constants, element constants, dotted-path lookup)

### Modified Capabilities
- `primitive-table`: The primitive table accepts external entries from extensions merged at init time, including dotted-path keys
- `babel-plugin`: The plugin accepts an `extensions` option, handles new primitive kinds (`prop-constant`, `className-constant`, `element-constant`), and performs dotted-path lookup in the Identifier visitor
- `unplugin-wrapper`: The unplugin plumbs `extensions` through to the babel plugin and pre-scan

## Impact

- `packages/babel/src/buildDslPrimitives.ts` — new primitive types, `HypeupExtension`/`ExtensionSymbol` types, extension merging logic, dotted-path key handling
- `packages/babel/src/hypeupBabelPlugin.ts` — accepts options, dotted-path lookup in Identifier visitor, new handlers for prop-constant, className-constant, element-constant
- `packages/babel/src/index.ts` — re-export `HypeupExtension`, `ExtensionSymbol`
- `packages/plugin/src/unplugin.ts` — extended `HypeupPluginOptions`, plumbing, root-segment pre-scan extraction
- `packages/babel/tests/plugin.test.ts` — new test groups for all symbol types, dotted paths, collisions, scope shadowing, element class chaining, prebaked children ordering
- No runtime changes. No breaking changes. Extensions are opt-in via plugin config.
