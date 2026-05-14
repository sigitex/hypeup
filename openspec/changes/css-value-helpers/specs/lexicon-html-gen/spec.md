## MODIFIED Requirements

### Requirement: HTML element declarations use function signatures
The generated `html.gen.ts` SHALL declare each HTML element as a global function with signature `function <name>(...contents: Content[]): Element`. It SHALL NOT reference `ElementBuilder`. When an element name collides with a JavaScript reserved word, the generated name SHALL use a `$` suffix (not an underscore prefix).

#### Scenario: Standard element declaration
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a standard element like `div` SHALL be declared as `function div(...contents: Content[]): Element`

#### Scenario: Void element declaration
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a void element like `br` SHALL be declared as `function br(...contents: Content[]): Element`

#### Scenario: Keyword-collision element uses $ suffix
- **WHEN** the generator produces `html.gen.ts`
- **THEN** the `<var>` element SHALL be declared as `function var$(...contents: Content[]): Element`
