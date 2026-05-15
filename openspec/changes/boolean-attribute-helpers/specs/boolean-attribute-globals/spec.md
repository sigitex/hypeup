## ADDED Requirements

### Requirement: Boolean attribute list discovery
The generator SHALL maintain a hardcoded list of boolean HTML attributes for discovery. The list SHALL contain 41 entries: `allowfullscreen`, `alpha`, `allowpopover`, `async`, `autofocus`, `autoplay`, `blocking`, `checked`, `compact`, `controls`, `declare`, `defer`, `disabled`, `disablepictureinpicture`, `disableremoteplayback`, `fetchpriority`, `formnovalidate`, `hidden`, `inert`, `ismap`, `itemscope`, `loop`, `multiple`, `muted`, `nomodule`, `noresize`, `noshade`, `novalidate`, `nowrap`, `open`, `playsinline`, `readonly`, `required`, `reversed`, `seamless`, `selected`, `shadowrootclonable`, `shadowrootdelegatesfocus`, `shadowrootserializable`, `truespeed`. The attribute `default` SHALL be excluded.

#### Scenario: All 41 boolean attributes discovered
- **WHEN** the generator discovers boolean attributes
- **THEN** the result SHALL contain exactly 41 entries

#### Scenario: default is excluded
- **WHEN** the generator discovers boolean attributes
- **THEN** `default` SHALL NOT appear in the result

### Requirement: JS keyword collision handling
Boolean attributes that collide with JS keywords SHALL use the `$` suffix convention. `async` SHALL be exposed as `async$`.

#### Scenario: async uses dollar suffix
- **WHEN** the generator processes the `async` boolean attribute
- **THEN** the JS identifier SHALL be `async$` and the HTML attribute name SHALL remain `async`

### Requirement: Boolean attributes are bare-only globals
Each boolean attribute SHALL be declared as an ambient global constant of type `Attr`. They SHALL NOT be callable (no function signature).

#### Scenario: checked is a const Attr
- **WHEN** a consumer uses `checked` in hypeup markup
- **THEN** TypeScript SHALL recognize it as type `Attr` without requiring an import

#### Scenario: Boolean attributes are not callable
- **WHEN** a consumer writes `checked("value")`
- **THEN** TypeScript SHALL report a type error because `Attr` is not callable

### Requirement: Boolean attribute babel transform
The babel plugin SHALL replace bare references to boolean attribute globals with `attr("name", true)` call expressions. The `attr` function SHALL be imported from `@hypeup/runtime`.

#### Scenario: Bare reference compiles to attr call
- **WHEN** source contains `input(checked)`
- **THEN** output SHALL contain `attr("checked", true)` with `attr` imported from `@hypeup/runtime`

#### Scenario: Dollar-suffix compiles to correct attr name
- **WHEN** source contains `script(async$)`
- **THEN** output SHALL contain `attr("async", true)`

#### Scenario: Locally bound name is not intercepted
- **WHEN** source contains `const checked = true; input(checked)`
- **THEN** `checked` SHALL NOT be transformed because it is locally bound

#### Scenario: Conditional usage with short-circuit
- **WHEN** source contains `input(isReady && checked)`
- **THEN** `checked` SHALL be transformed to `attr("checked", true)` and `isReady && attr("checked", true)` SHALL be the result
