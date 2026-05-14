## MODIFIED Requirements

### Requirement: Generated runtime data file
The generator SHALL produce `src/primitives.gen.ts` containing machine-readable exports of all DSL identifiers as typed `const` values. Collision-avoidance names SHALL use the `$` suffix convention (not underscore prefix).

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
- **THEN** it SHALL export `cssProperties` as a `const` object mapping camelCase JS names to objects containing `cssName` (kebab-case CSS name) and `keywords` (array of valid keyword strings). JS-reserved property names SHALL use `$` suffix (e.g., `continue$` maps to `cssName: "continue"`)

#### Scenario: cssUnits export
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `cssUnits` as a `const` object mapping JS identifier names to CSS unit strings (e.g., `{ px: "px", em$: "em", rem: "rem", deg: "deg", in$: "in" }`)

#### Scenario: cssFunctions export
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** it SHALL export `cssFunctions` as a `const` object mapping JS identifier names to CSS function names (e.g., `{ rgb: "rgb", hsl: "hsl", oklch: "oklch", url: "url" }`)
