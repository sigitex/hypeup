## MODIFIED Requirements

### Requirement: HTML element declarations use function signatures
The generated `html.gen.ts` SHALL declare each HTML element global with tag-specific typed content. Each generated element declaration SHALL use the element's JavaScript-safe name and a content type specialized to the HTML tag name. It SHALL provide autocomplete for valid attributes and values when used as an element call.

#### Scenario: Standard element declaration
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a standard element like `div` SHALL be declared with content specialized to the `"div"` tag

#### Scenario: Void element declaration
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a void element like `br` SHALL be declared with content specialized to the `"br"` tag

#### Scenario: Keyword-collision element uses underscore prefix
- **WHEN** the generator produces `html.gen.ts`
- **THEN** the `<var>` element SHALL be declared as `_var` with content specialized to the `"var"` tag

### Requirement: HTML gen imports from @hypeup/runtime
The generated `html.gen.ts` SHALL use type imports from `@hypeup/runtime` for runtime-exposed node and builder types. It SHALL NOT import generated HTML declaration types from `@hypeup/vdom` directly.

#### Scenario: Import statement uses runtime
- **WHEN** `html.gen.ts` is inspected
- **THEN** its public generated type imports SHALL reference `@hypeup/runtime`, not `@hypeup/vdom`

### Requirement: HTML gen uses declare global
The generated `html.gen.ts` SHALL wrap all element declarations and generated content/attribute helper types in a `declare global` block.

#### Scenario: Declarations are ambient globals
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** all HTML element functions SHALL be available in the global scope without explicit imports
