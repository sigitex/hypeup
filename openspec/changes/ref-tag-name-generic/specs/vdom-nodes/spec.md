## MODIFIED Requirements

### Requirement: Ref class generic constraint
The `Ref` class SHALL have a generic parameter `T extends Element = Element`. It SHALL have a single field `current: T | null` initialized to `null`.

#### Scenario: Ref construction
- **WHEN** `new Ref<HTMLInputElement>()` is called
- **THEN** `ref.current` SHALL be `null` and typed as `HTMLInputElement | null`

#### Scenario: Ref with SVG element type
- **WHEN** `new Ref<SVGSVGElement>()` is called
- **THEN** `ref.current` SHALL be `null` and typed as `SVGSVGElement | null`

#### Scenario: Ref default type
- **WHEN** `new Ref()` is called without a type parameter
- **THEN** `ref.current` SHALL be typed as `Element | null`
