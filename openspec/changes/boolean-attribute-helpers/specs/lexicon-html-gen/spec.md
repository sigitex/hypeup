## MODIFIED Requirements

### Requirement: HTML gen imports from @hypeup/runtime
The generated `html.gen.ts` SHALL use `import type { Element, Attr } from "@hypeup/runtime"` for its type imports. It SHALL NOT import from `@hypeup/vdom`.

#### Scenario: Import statement includes Attr
- **WHEN** `html.gen.ts` is inspected
- **THEN** the import statement SHALL include both `Element` and `Attr` from `@hypeup/runtime`

## ADDED Requirements

### Requirement: Boolean attribute declarations in html.gen.ts
The generated `html.gen.ts` SHALL include `declare global` entries for each boolean attribute as a `const` of type `Attr`.

#### Scenario: Boolean attribute declared as const Attr
- **WHEN** the generator produces `html.gen.ts`
- **THEN** a boolean attribute like `checked` SHALL be declared as `const checked: Attr`

#### Scenario: Dollar-suffix boolean attribute declared
- **WHEN** the generator produces `html.gen.ts`
- **THEN** `async` SHALL be declared as `const async$: Attr`

#### Scenario: Boolean attributes have doc comments
- **WHEN** the generator produces `html.gen.ts`
- **THEN** each boolean attribute declaration SHALL have a JSDoc comment like `/** Boolean \`checked\` HTML attribute. */`
