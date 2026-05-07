## ADDED Requirements

### Requirement: OnCreate node type
An `OnCreate` class SHALL exist with a single field `callback: (el: HTMLElement) => void`. It SHALL be constructable via `new OnCreate(callback)`.

#### Scenario: OnCreate construction
- **WHEN** `new OnCreate((el) => console.log(el))` is called
- **THEN** `onCreate.callback` SHALL be the provided function

### Requirement: OnRemove node type
An `OnRemove` class SHALL exist with a single field `callback: (el: HTMLElement) => void`. It SHALL be constructable via `new OnRemove(callback)`.

#### Scenario: OnRemove construction
- **WHEN** `new OnRemove((el) => console.log(el))` is called
- **THEN** `onRemove.callback` SHALL be the provided function

## MODIFIED Requirements

### Requirement: No factories or ElementBuilder
The `factories/` directory and `ElementBuilder` type SHALL be deleted. The `@hypeup/vdom` package SHALL export no Proxy-backed constructors.

#### Scenario: Package exports
- **WHEN** the `@hypeup/vdom` package is imported
- **THEN** it SHALL export `Element`, `Rule`, `AtRule`, `Property`, `Raw`, `CssClass`, `Attr`, `OnCreate`, `OnRemove` and no other runtime values

### Requirement: Flat directory layout
All node class files SHALL live directly under `vdom/src/`, not in a `nodes/` subdirectory. The `factories/` subdirectory SHALL not exist.

#### Scenario: File structure
- **WHEN** listing `vdom/src/`
- **THEN** it SHALL contain `Element.ts`, `Rule.ts`, `AtRule.ts`, `Property.ts`, `Raw.ts`, `CssClass.ts`, `Attr.ts`, `OnCreate.ts`, `OnRemove.ts`, and `index.ts` at the top level with no `nodes/` or `factories/` subdirectories
