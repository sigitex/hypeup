## ADDED Requirements

### Requirement: Generated runtime data file
The generator SHALL produce `src/primitives.gen.ts` containing machine-readable exports of all DSL identifiers as typed `const` values.

#### Scenario: htmlTags export
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `htmlTags` as a `const` array of all HTML tag name strings (e.g., `["a", "abbr", "address", ...]`)

#### Scenario: voidHtmlTags export
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `voidHtmlTags` as a `const` array of void HTML tag name strings (e.g., `["area", "base", "br", ...]`)

#### Scenario: atRules export
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `atRules` as a `const` object mapping JS identifier names to CSS at-rule strings (e.g., `{ $media: "@media", $keyframes: "@keyframes" }`)

#### Scenario: cssProperties export
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `cssProperties` as a `const` object mapping camelCase JS names to objects containing `cssName` (kebab-case CSS name) and `keywords` (array of valid keyword strings)

### Requirement: Subpath export for transformer consumption
The `@hypeup/lexicon` package SHALL expose `primitives.gen.ts` via the subpath export `"./primitives"`. This is the only import path the build transformer uses.

#### Scenario: Import via subpath
- **WHEN** the build transformer imports `from "@hypeup/lexicon/primitives"`
- **THEN** it SHALL receive the `htmlTags`, `voidHtmlTags`, `atRules`, and `cssProperties` exports

### Requirement: Generator discovers data from existing sources
The generator SHALL derive `primitives.gen.ts` data from the same discovery phase used for `html.gen.ts` and `css.gen.ts`. It SHALL NOT hardcode tag lists or property lists.

#### Scenario: Data matches type declarations
- **WHEN** the generator runs
- **THEN** every HTML tag declared in `html.gen.ts` SHALL have a corresponding entry in `htmlTags` (or `voidHtmlTags` for void elements)

#### Scenario: CSS properties match
- **WHEN** the generator runs
- **THEN** every CSS property declared in `css.gen.ts` SHALL have a corresponding entry in `cssProperties`
