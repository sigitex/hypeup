## ADDED Requirements

### Requirement: AllTags type alias
A type alias `AllTags` SHALL be defined as `keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap`. It SHALL include all standard HTML and SVG tag name strings.

#### Scenario: AllTags includes HTML tags
- **WHEN** the type `AllTags` is inspected
- **THEN** it SHALL include `"input"`, `"div"`, `"a"`, `"span"`, and all other HTML tag names from `HTMLElementTagNameMap`

#### Scenario: AllTags includes SVG tags
- **WHEN** the type `AllTags` is inspected
- **THEN** it SHALL include `"svg"`, `"path"`, `"circle"`, `"rect"`, and all other SVG tag names from `SVGElementTagNameMap`

### Requirement: ResolveTag conditional type
A conditional type `ResolveTag<K extends AllTags>` SHALL map tag name strings to their corresponding DOM element types. It SHALL check `HTMLElementTagNameMap` first, then `SVGElementTagNameMap`.

#### Scenario: HTML tag resolution
- **WHEN** `ResolveTag<"input">` is evaluated
- **THEN** it SHALL resolve to `HTMLInputElement`

#### Scenario: SVG tag resolution
- **WHEN** `ResolveTag<"path">` is evaluated
- **THEN** it SHALL resolve to `SVGPathElement`

#### Scenario: HTML takes precedence for overlapping tags
- **WHEN** `ResolveTag<"a">` is evaluated
- **THEN** it SHALL resolve to `HTMLAnchorElement` (not `SVGAElement`)

#### Scenario: Union distribution
- **WHEN** `ResolveTag<AllTags>` is evaluated
- **THEN** it SHALL resolve to the union of all HTML and SVG element types

### Requirement: ref function uses tag name generic
The `ref` function SHALL accept a single generic parameter `K extends AllTags` that defaults to `AllTags`. It SHALL return `Ref<ResolveTag<K>>`.

#### Scenario: Typed ref with HTML tag
- **WHEN** `ref<"input">()` is called
- **THEN** the return type SHALL be `Ref<HTMLInputElement>`
- **AND** `.current` SHALL be typed as `HTMLInputElement | null`

#### Scenario: Typed ref with SVG tag
- **WHEN** `ref<"svg">()` is called
- **THEN** the return type SHALL be `Ref<SVGSVGElement>`
- **AND** `.current` SHALL be typed as `SVGSVGElement | null`

#### Scenario: Bare ref with no type parameter
- **WHEN** `ref()` is called without a type parameter
- **THEN** the return type SHALL be `Ref<ResolveTag<AllTags>>`
- **AND** `.current` SHALL be typed as the full union of all element types or `null`

#### Scenario: Invalid tag name rejected
- **WHEN** `ref<"notarealtag">()` is written
- **THEN** TypeScript SHALL report a type error
