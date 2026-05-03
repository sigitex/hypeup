## Requirements

### Requirement: Ambient declarations for escape-hatch globals
`src/primitives.ts` SHALL contain `declare global` declarations for all escape-hatch globals, alongside its re-export of `primitives.gen.ts`. The file SHALL use `import type` from `@hypeup/runtime` for type references. Because `primitives.ts` is imported by `index.ts` (via `import "./primitives"`), the global declarations SHALL be visible to any consumer that imports `@hypeup/lexicon`. The `on` function SHALL use overloads to provide strongly-typed event inference from `GlobalEventHandlersEventMap`, with a `string` fallback for custom events.

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

#### Scenario: on function declaration (known events)
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `on` SHALL be available as a global function with generic overload: `on<K extends keyof GlobalEventHandlersEventMap>(event: K, handler: (e: GlobalEventHandlersEventMap[K]) => void): EventBinding`
- **AND** the handler parameter type SHALL be inferred from the event name (e.g., `on("click", (e) => ...)` infers `e: MouseEvent`)

#### Scenario: on function declaration (custom events)
- **WHEN** a consumer calls `on` with an event name not in `GlobalEventHandlersEventMap`
- **THEN** the fallback overload SHALL accept `(event: string, handler: (e: Event) => void): EventBinding`
- **AND** the handler parameter SHALL be typed as `Event`

#### Scenario: No manual type annotations needed
- **WHEN** a consumer writes `on("keydown", (e) => e.key)`
- **THEN** TypeScript SHALL infer `e` as `KeyboardEvent` without explicit annotation
- **AND** `e.key` SHALL type-check successfully

### Requirement: Runtime primitives file deleted
`src/primitives.d.ts` SHALL be deleted. The global declarations it contained SHALL be moved into `src/primitives.ts`. The standalone `.d.ts` approach does not work for consumer packages because ambient declaration files outside the consumer's `include` glob are not part of the TypeScript compilation.

#### Scenario: No standalone primitives.d.ts
- **WHEN** the lexicon `src/` directory is listed
- **THEN** `primitives.d.ts` SHALL NOT exist

#### Scenario: primitives.ts contains globals and re-export
- **WHEN** `src/primitives.ts` is inspected
- **THEN** it SHALL contain both `export * from "./primitives.gen"` and a `declare global` block with all helper declarations

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
