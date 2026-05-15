## ADDED Requirements

### Requirement: booleanAttrs export in primitives.gen.ts
The generated `primitives.gen.ts` SHALL export a `booleanAttrs` constant: an object mapping JS identifier names to HTML attribute name strings.

#### Scenario: booleanAttrs export exists
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `booleanAttrs` as a `const` object (e.g., `{ checked: "checked", async$: "async", disabled: "disabled", ... }`)

#### Scenario: Dollar-suffix mapped to bare attr name
- **WHEN** `booleanAttrs` contains the `async$` entry
- **THEN** its value SHALL be the string `"async"` (the HTML attribute name, not the JS identifier)

#### Scenario: All 41 boolean attributes present
- **WHEN** `booleanAttrs` is inspected
- **THEN** it SHALL contain exactly 41 entries matching the discovered boolean attribute list

## MODIFIED Requirements

### Requirement: Subpath export for transformer consumption
The `@hypeup/lexicon` package SHALL expose `primitives.gen.ts` via the subpath export `"./primitives"`. This is the only import path the build transformer uses.

#### Scenario: Import via subpath
- **WHEN** the build transformer imports `from "@hypeup/lexicon/primitives"`
- **THEN** it SHALL receive the `htmlTags`, `voidHtmlTags`, `atRules`, `cssProperties`, and `booleanAttrs` exports
