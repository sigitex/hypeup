## ADDED Requirements

### Requirement: CSS gen imports from @hypeup/runtime
The generated `css.gen.ts` SHALL use `import type` from `@hypeup/runtime` for `Property` and `AtRule` types. It SHALL NOT import from `@hypeup/vdom`.

#### Scenario: Import statement uses runtime
- **WHEN** `css.gen.ts` is inspected
- **THEN** the import statement SHALL reference `@hypeup/runtime`, not `@hypeup/vdom`

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

### Requirement: CSS at-rule declarations as ambient globals
The generated `css.gen.ts` SHALL declare at-rules as ambient global functions (e.g., `$media`, `$keyframes`) that return `AtRule`.

#### Scenario: At-rule declaration
- **WHEN** `css.gen.ts` is inspected
- **THEN** `$media` SHALL be declared as a function returning `AtRule`

### Requirement: CSS-wide keywords available on all properties
The generated CSS type declarations SHALL include CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`, `revert-layer`) as dot-syntax members on every CSS property. These keywords SHALL be sourced from CSS Cascading and Inheritance Level 5.

#### Scenario: Property with existing keywords gains global keywords
- **WHEN** `css.gen.ts` is inspected for a property like `display` which already has keywords (`block`, `inline`, etc.)
- **THEN** it SHALL also have `display.initial`, `display.inherit`, `display.unset`, `display.revert`, and `display.revertLayer` as `Property` members

#### Scenario: Property without existing keywords gains global keywords
- **WHEN** `css.gen.ts` is inspected for a property like `textDecoration` which previously had no keywords
- **THEN** it SHALL be declared as a `const` with `(value: Content): Property` callable plus `initial`, `inherit`, `unset`, `revert`, and `revertLayer` keyword members

#### Scenario: Global keywords do not duplicate on `all` property
- **WHEN** `css.gen.ts` is inspected for the `all` property
- **THEN** each CSS-wide keyword SHALL appear exactly once (no duplicates from both webref and injection)

### Requirement: Only @webref/css properties are generated
The CSS property generator SHALL use `@webref/css` as the sole data source for CSS properties. The `known-css-properties` package SHALL NOT be used. Properties not defined in `@webref/css` SHALL NOT appear in the generated output.

#### Scenario: Bogus properties removed
- **WHEN** `css.gen.ts` is inspected
- **THEN** properties like `textDecorationUnderline`, `textDecorationBlink`, `textDecorationLineThrough`, and `textDecorationNone` SHALL NOT be present

#### Scenario: Vendor-prefixed duplicates removed
- **WHEN** `primitives.gen.ts` is inspected
- **THEN** vendor-prefixed properties that were only in `known-css-properties` (not in `@webref/css`) SHALL NOT be present

#### Scenario: Legitimate webref properties preserved
- **WHEN** `css.gen.ts` is inspected
- **THEN** all properties from `@webref/css` (e.g., `color`, `display`, `textDecorationLine`, `margin`) SHALL still be present with their keywords
