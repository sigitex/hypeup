## MODIFIED Requirements

### Requirement: File filter and extensions plumbing
The plugin SHALL filter files by default to `/\.[jt]sx?$/` and exclude `node_modules`. Users SHALL be able to override the filter to include workspace packages. The `HypeupPluginOptions` type SHALL include an optional `extensions` field (array of `HypeupExtension`). Extensions SHALL be passed through to `buildDslPrimitives()` for the pre-scan identifier set and to `hypeupBabelPlugin` for the transform.

#### Scenario: Default filter processes TS files
- **WHEN** a `.ts` file passes through the plugin
- **THEN** it SHALL be transformed

#### Scenario: Default filter skips node_modules
- **WHEN** a file under `node_modules/` passes through the plugin
- **THEN** it SHALL NOT be transformed

#### Scenario: Extension root segments included in pre-scan
- **WHEN** extensions define symbols `fs`, `"m4.x"`, and `"container.sm"`
- **THEN** the pre-scan identifier set SHALL include `fs`, `m4`, and `container` (root segments only)

#### Scenario: Extensions passed to babel plugin
- **WHEN** the unplugin is initialized with `{ extensions: [...] }`
- **THEN** the same extensions array SHALL be passed to `hypeupBabelPlugin({ extensions: [...] })`
