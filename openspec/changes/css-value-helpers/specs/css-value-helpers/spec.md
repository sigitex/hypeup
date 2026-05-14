## ADDED Requirements

### Requirement: CSS unit helper functions as ambient globals
The generated `values.gen.ts` SHALL declare all CSS units from `css-tree`'s `lexer.units` as ambient global functions in a `declare global` block. Each unit function SHALL accept a single `number` argument and return `string`. The output string SHALL be the number concatenated with the unit (e.g., `px(10)` returns `"10px"`).

#### Scenario: Length unit function
- **WHEN** `px(10)` is called
- **THEN** it SHALL return the string `"10px"`

#### Scenario: Angle unit function
- **WHEN** `deg(45)` is called
- **THEN** it SHALL return the string `"45deg"`

#### Scenario: Time unit function
- **WHEN** `ms(300)` is called
- **THEN** it SHALL return the string `"300ms"`

#### Scenario: Flex unit function
- **WHEN** `fr(1)` is called
- **THEN** it SHALL return the string `"1fr"`

#### Scenario: Fractional values
- **WHEN** `em(1.5)` is called (via `em$` due to collision)
- **THEN** it SHALL return the string `"1.5em"`

#### Scenario: Zero value
- **WHEN** `px(0)` is called
- **THEN** it SHALL return the string `"0px"`

### Requirement: CSS color function helpers as ambient globals
The generated `values.gen.ts` SHALL declare `rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, and `oklch` as ambient global functions. Each SHALL accept 3 required numeric arguments plus an optional alpha argument, and return `string` using modern CSS space-separated syntax.

#### Scenario: rgb without alpha
- **WHEN** `rgb(255, 0, 128)` is called
- **THEN** it SHALL return the string `"rgb(255 0 128)"`

#### Scenario: rgb with alpha
- **WHEN** `rgb(255, 0, 128, 0.5)` is called
- **THEN** it SHALL return the string `"rgb(255 0 128 / 0.5)"`

#### Scenario: hsl without alpha
- **WHEN** `hsl(180, 50, 75)` is called
- **THEN** it SHALL return the string `"hsl(180 50 75)"`

#### Scenario: hsl with alpha
- **WHEN** `hsl(180, 50, 75, 0.8)` is called
- **THEN** it SHALL return the string `"hsl(180 50 75 / 0.8)"`

#### Scenario: oklch without alpha
- **WHEN** `oklch(0.7, 0.15, 180)` is called
- **THEN** it SHALL return the string `"oklch(0.7 0.15 180)"`

#### Scenario: oklch with alpha
- **WHEN** `oklch(0.7, 0.15, 180, 0.5)` is called
- **THEN** it SHALL return the string `"oklch(0.7 0.15 180 / 0.5)"`

### Requirement: url helper function as ambient global
The generated `values.gen.ts` SHALL declare `url` as an ambient global function that accepts a single `string` argument and returns `string`.

#### Scenario: url with path
- **WHEN** `url("image.png")` is called
- **THEN** it SHALL return the string `"url(image.png)"`

#### Scenario: url with full URL
- **WHEN** `url("https://example.com/bg.jpg")` is called
- **THEN** it SHALL return the string `"url(https://example.com/bg.jpg)"`

### Requirement: Collision avoidance uses $ suffix
When a generated global name collides with an existing HTML element global, CSS property/keyword global, or JavaScript reserved word, the generated name SHALL use a `$` suffix. This applies to unit functions, HTML element declarations, and CSS property declarations.

#### Scenario: Unit collides with HTML element
- **WHEN** `values.gen.ts` is inspected for the `em` unit (which collides with HTML `<em>`)
- **THEN** it SHALL be declared as `em$`

#### Scenario: Unit collides with CSS keyword
- **WHEN** `values.gen.ts` is inspected for the `cap` unit (which collides with a CSS keyword)
- **THEN** it SHALL be declared as `cap$`

#### Scenario: Unit collides with JS reserved word
- **WHEN** `values.gen.ts` is inspected for the `in` unit (inches, which collides with JS `in`)
- **THEN** it SHALL be declared as `in$`

#### Scenario: Non-colliding unit keeps original name
- **WHEN** `values.gen.ts` is inspected for the `px` unit
- **THEN** it SHALL be declared as `px` (no suffix)

### Requirement: No deprecated color function aliases
The generated output SHALL NOT include `rgba` or `hsla` functions. The modern `rgb` and `hsl` functions accept an optional alpha parameter, making the legacy aliases unnecessary.

#### Scenario: rgba not generated
- **WHEN** `values.gen.ts` is inspected
- **THEN** `rgba` SHALL NOT be declared

#### Scenario: hsla not generated
- **WHEN** `values.gen.ts` is inspected
- **THEN** `hsla` SHALL NOT be declared
