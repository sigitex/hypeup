## ADDED Requirements

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
