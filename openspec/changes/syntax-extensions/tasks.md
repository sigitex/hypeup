## 1. Types and Primitive Table

- [ ] 1.1 Add `ExtensionSymbol` discriminated union type: `AliasSymbol | PropSymbol | ClassNameSymbol | ElementSymbol`
- [ ] 1.2 Add `HypeupExtension` type as `Record<string, ExtensionSymbol>`
- [ ] 1.3 Add new primitive kinds to `Primitive` union: `PropConstantPrimitive`, `ClassNameConstantPrimitive`, `ElementConstantPrimitive`
- [ ] 1.4 Update `buildDslPrimitives()` to accept optional `extensions?: HypeupExtension[]` parameter
- [ ] 1.5 Implement extension merging: iterate each extension's entries in array order, resolve by `type`:
  - `"alias"`: look up target in table (throw if not found), check collision (throw if exists), insert same Primitive entry
  - `"prop"`: check collision, insert `PropConstantPrimitive`
  - `"className"`: check collision, insert `ClassNameConstantPrimitive`
  - `"element"`: check collision, insert `ElementConstantPrimitive` (store tag, className, props, attrs)
- [ ] 1.6 Handle dotted-path keys: store as-is in table (dots in the key string)
- [ ] 1.7 Re-export `HypeupExtension` and `ExtensionSymbol` from `packages/babel/src/index.ts`

## 2. Babel Plugin — Dotted-Path Lookup

- [ ] 2.1 In Identifier visitor, before `handlePrimitive()`: if parent is MemberExpression with identifier as object, collect full chain and try longest-match lookup against table
- [ ] 2.2 If dotted-path match found: check scope shadowing on root identifier, then dispatch matched primitive to handler, replacing the entire chain (MemberExpression or CallExpression wrapping it)
- [ ] 2.3 If no dotted-path match: fall through to existing root-identifier handling (which may itself handle dot segments per kind)

## 3. Babel Plugin — New Handlers

- [ ] 3.1 Add `handlePropConstant()`: if parent is CallExpression and identifier is callee, skip; otherwise replace with `prop(css, value)`
- [ ] 3.2 Add `handleClassNameConstant()`: if parent is CallExpression and identifier is callee, skip; otherwise replace with `className(value)`
- [ ] 3.3 Add `handleElementConstant()`: expand to `elem(tag, [...prebaked, ...user])` or `elemVoid(tag, [...prebaked])`. Prebaked children: className first, then props, then attrs. Void inferred from tag being in `voidHtmlTags`
- [ ] 3.4 Element constant dot-segment fallback: unmatched segments after longest-match become additional `className()` calls inserted after prebaked children, before user args
- [ ] 3.5 Element constant call form: `container("hello")` expands with user args; bare `container` expands with only prebaked children
- [ ] 3.6 Update `handlePrimitive()` switch to dispatch new primitive kinds

## 4. Unplugin Integration

- [ ] 4.1 Add `extensions?: HypeupExtension[]` to `HypeupPluginOptions` in `packages/plugin/src/unplugin.ts`
- [ ] 4.2 Extract root segments from dotted-path keys for pre-scan identifier set
- [ ] 4.3 Pass `extensions` to `buildDslPrimitives()` for pre-scan
- [ ] 4.4 Pass `extensions` to `hypeupBabelPlugin()` in transform call

## 5. Tests

- [ ] 5.1 Add helper to create plugin with extensions option for test transforms
- [ ] 5.2 Test alias of CSS property (call form and keyword access)
- [ ] 5.3 Test alias of builtin (`cc` -> `className`)
- [ ] 5.4 Test alias of HTML element (`d` -> `div`)
- [ ] 5.5 Test alias of extension-defined symbol (alias targeting another extension's entry)
- [ ] 5.6 Test bare prop constant expansion (`m4` -> `prop("margin", "4px")`)
- [ ] 5.7 Test prop constant inside element children (`div(m4)`)
- [ ] 5.8 Test prop constant in call position NOT transformed (`m4("8px")`)
- [ ] 5.9 Test prop constant in member-expression position with no dotted-path match NOT transformed
- [ ] 5.10 Test className constant expansion (`active` -> `className("active")`)
- [ ] 5.11 Test element constant bare call (`container("hello")`)
- [ ] 5.12 Test element constant bare reference (no call)
- [ ] 5.13 Test element constant with prebaked className, props, attrs — verify ordering
- [ ] 5.14 Test element constant void tag inferred (`{ type: "element", tag: "img", attrs: { src: "/logo.png" } }`)
- [ ] 5.15 Test element constant dot-segment class chaining (`container.active("hello")`)
- [ ] 5.16 Test dotted-path prop constant (`m4.x` -> `prop("margin-inline", "4px")`)
- [ ] 5.17 Test dotted-path element constant (`container.sm` -> `elem("div", [className("container-sm")])`)
- [ ] 5.18 Test longest-match: `container.sm.fluid` registered, `container.sm.fluid.active` falls back to `container.sm.fluid` + className `active`
- [ ] 5.19 Test dotted-path with no root entry (`m4.x` exists, bare `m4` not transformed)
- [ ] 5.20 Test scope shadowing suppresses entire dotted-path chain
- [ ] 5.21 Test scope shadowing of aliases and constants
- [ ] 5.22 Test invalid alias target throws
- [ ] 5.23 Test collision with built-in throws
- [ ] 5.24 Test collision between extensions throws
- [ ] 5.25 Test multiple extensions aggregating symbols
