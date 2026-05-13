## MODIFIED Requirements

### Requirement: CSS property declarations as ambient globals
The generated `css.gen.ts` SHALL declare CSS properties as ambient globals in a `declare global` block. Each property SHALL be a callable that accepts `(value: Content): Property`, with keyword sub-properties that return `Property` directly. Shorthand properties SHALL include keywords from their direct longhand property references (one level only, no recursive resolution).

#### Scenario: Property with keywords
- **WHEN** `css.gen.ts` is inspected
- **THEN** a property like `color` SHALL be declared as a callable `(value: Content): Property` with keyword members like `color.red: Property`

#### Scenario: Property without keywords
- **WHEN** `css.gen.ts` is inspected
- **THEN** a property like `zIndex` SHALL be declared as a callable `(value: Content): Property`

#### Scenario: Shorthand property gains longhand keywords
- **WHEN** `css.gen.ts` is inspected for `textDecoration`
- **THEN** it SHALL include keywords from its direct longhands: `underline`, `overline`, `lineThrough`, `solid`, `double`, `dotted`, `dashed`, `wavy`, `none`, `auto`, `fromFont` (among others)

#### Scenario: Shorthand overflow gains longhand keywords
- **WHEN** `css.gen.ts` is inspected for `overflow`
- **THEN** it SHALL include keywords `visible`, `hidden`, `clip`, `scroll`, `auto` from its longhand `overflow-block`

#### Scenario: Longhand keywords preserve original spec attribution
- **WHEN** `textDecoration.underline` is inspected in `css.gen.ts`
- **THEN** its doc comment SHALL reference `css-text-decor-4` (the longhand's spec), not the shorthand's spec

#### Scenario: No duplicate keywords from longhand resolution
- **WHEN** a shorthand and its longhand share a keyword name
- **THEN** the keyword SHALL appear exactly once on the shorthand (deduplicated by `addValue`)

#### Scenario: No recursive property resolution
- **WHEN** a longhand itself references another property via `<'property-name'>` syntax
- **THEN** those second-level references SHALL NOT be followed — only direct longhand keywords are included
