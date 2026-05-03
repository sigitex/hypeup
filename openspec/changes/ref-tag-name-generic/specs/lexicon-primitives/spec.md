## MODIFIED Requirements

### Requirement: Ambient declarations for escape-hatch globals
`src/primitives.ts` SHALL contain `declare global` declarations for all escape-hatch globals, alongside its re-export of `primitives.gen.ts`. The file SHALL use `import type` from `@hypeup/runtime` for type references. Because `primitives.ts` is imported by `index.ts` (via `import "./primitives"`), the global declarations SHALL be visible to any consumer that imports `@hypeup/lexicon`. The `on` function SHALL use overloads to provide strongly-typed event inference from `GlobalEventHandlersEventMap`, with a `string` fallback for custom events. The `ref` function SHALL use tag name string generics with `AllTags` and `ResolveTag` types to resolve tag names to DOM element types.

#### Scenario: ref function declaration (tag name generic)
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `ref` SHALL be available as a global function with signature `ref<K extends AllTags = AllTags>(): Ref<ResolveTag<K>>`

#### Scenario: ref with HTML tag name
- **WHEN** a consumer writes `const r = ref<"input">()`
- **THEN** TypeScript SHALL infer the type of `r` as `Ref<HTMLInputElement>`
- **AND** `r.current` SHALL be typed as `HTMLInputElement | null`

#### Scenario: ref with SVG tag name
- **WHEN** a consumer writes `const r = ref<"svg">()`
- **THEN** TypeScript SHALL infer the type of `r` as `Ref<SVGSVGElement>`

#### Scenario: bare ref
- **WHEN** a consumer writes `const r = ref()`
- **THEN** TypeScript SHALL infer `r.current` as the union of all element types or `null`

#### Scenario: AllTags and ResolveTag available globally
- **WHEN** a consumer imports `@hypeup/lexicon`
- **THEN** `AllTags` and `ResolveTag` SHALL be available as global types in the `declare global` block
