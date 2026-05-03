## ADDED Requirements

### Requirement: Ambient declarations for escape-hatch globals
`src/primitives.d.ts` SHALL declare all escape-hatch globals as ambient `declare global` declarations. The file SHALL contain `import type` from `@hypeup/runtime` for type references. The file SHALL end with `export {}` to ensure it is treated as a module.

#### Scenario: elem function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `elem` SHALL be available as a global function with signature `(tag: string, ...contents: Content[]): Element`

#### Scenario: elemVoid function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `elemVoid` SHALL be available as a global function with signature `(tag: string, ...contents: Content[]): Element`

#### Scenario: prop function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `prop` SHALL be available as a global function with signature `(name: string, value: Content): Property`

#### Scenario: attr function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `attr` SHALL be available as a global function with signature `(name: string, value: Content): Attr`

#### Scenario: raw function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `raw` SHALL be available as a global function with signature `(x: Content): Raw`

#### Scenario: rule function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `rule` SHALL be available as a global function with signature `(selector: string, ...contents: Content[]): Rule`

#### Scenario: className function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `className` SHALL be available as a global function with signature `(name: string): CssClass`

#### Scenario: cssString function declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `cssString` SHALL be available as a global function with signature `(text: string): string`

#### Scenario: doctype constant declaration
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `doctype` SHALL be available as a global constant with property `html5: Raw`

### Requirement: No runtime code in primitives
`src/primitives.d.ts` SHALL contain only type declarations. It SHALL NOT import any runtime modules (no non-type imports). It SHALL NOT contain function implementations.

#### Scenario: File contains no executable code
- **WHEN** `src/primitives.d.ts` is inspected
- **THEN** it SHALL contain only `import type` statements, `declare global` blocks, and `export {}`

### Requirement: Runtime primitives file deleted
The original `src/primitives.ts` (with runtime implementations) SHALL be deleted. It SHALL NOT coexist with `primitives.d.ts`.

#### Scenario: No primitives.ts in source
- **WHEN** the lexicon `src/` directory is listed
- **THEN** `primitives.ts` SHALL NOT exist and `primitives.d.ts` SHALL exist

### Requirement: Package entry point
`src/index.ts` SHALL exist as the package entry point. It SHALL contain side-effect imports of `./html.gen`, `./css.gen`, and `./primitives` to merge all `declare global` blocks into consumer scope.

#### Scenario: Side-effect imports merge globals
- **WHEN** a consumer has `import "@hypeup/lexicon"` in their entry file
- **THEN** all HTML tag functions, CSS property globals, and escape-hatch primitives SHALL be available in the global TypeScript scope

### Requirement: Dependency cleanup
The lexicon `package.json` SHALL NOT list `cssesc`, `@types/cssesc`, or `@hypeup/vdom` as dependencies. The `exports` field SHALL use subpath exports: `"."` mapping to `./src/index.ts` and `"./primitives"` mapping to `./src/primitives.gen.ts`.

#### Scenario: No cssesc dependency
- **WHEN** `package.json` is inspected
- **THEN** `cssesc` SHALL NOT appear in `dependencies` or `devDependencies`

#### Scenario: No @types/cssesc dependency
- **WHEN** `package.json` is inspected
- **THEN** `@types/cssesc` SHALL NOT appear in `devDependencies`

#### Scenario: No vdom dependency
- **WHEN** `package.json` is inspected
- **THEN** `@hypeup/vdom` SHALL NOT appear in `dependencies`

#### Scenario: Subpath exports configured
- **WHEN** `package.json` is inspected
- **THEN** `exports` SHALL be an object with `"."` pointing to `"./src/index.ts"` and `"./primitives"` pointing to `"./src/primitives.gen.ts"`
