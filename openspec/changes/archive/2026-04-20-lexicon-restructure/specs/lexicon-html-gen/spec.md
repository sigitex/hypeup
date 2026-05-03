## ADDED Requirements

### Requirement: HTML element declarations use function signatures
The generated `html.gen.ts` SHALL declare each HTML element as a global function with signature `function <name>(...contents: Content[]): Element`. It SHALL NOT reference `ElementBuilder`.

#### Scenario: Standard element declaration
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a standard element like `div` SHALL be declared as `function div(...contents: Content[]): Element`

#### Scenario: Void element declaration
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a void element like `br` SHALL be declared as `function br(...contents: Content[]): Element`

#### Scenario: Keyword-collision element uses underscore prefix
- **WHEN** the generator produces `html.gen.ts`
- **THEN** the `<var>` element SHALL be declared as `function _var(...contents: Content[]): Element`

### Requirement: HTML gen imports from @hypeup/runtime
The generated `html.gen.ts` SHALL use `import type { Element } from "@hypeup/runtime"` for its type imports. It SHALL NOT import from `@hypeup/vdom`.

#### Scenario: Import statement uses runtime
- **WHEN** `html.gen.ts` is inspected
- **THEN** the import statement SHALL reference `@hypeup/runtime`, not `@hypeup/vdom`

### Requirement: HTML gen uses declare global
The generated `html.gen.ts` SHALL wrap all element declarations in a `declare global` block.

#### Scenario: Declarations are ambient globals
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** all HTML element functions SHALL be available in the global scope without explicit imports
