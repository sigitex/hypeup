## 1. Types and Primitive Table

- [ ] 1.1 Add `ConstantPrimitive` type (`{ kind: "constant"; cssName: string; value: string }`) to the `Primitive` union in `packages/babel/src/buildDslPrimitives.ts`
- [ ] 1.2 Add `HypeupExtension` type (`{ aliases?: Record<string, string>; constants?: Record<string, [string, string]> }`) and export it from `packages/babel/src/buildDslPrimitives.ts`
- [ ] 1.3 Update `buildDslPrimitives()` to accept optional `extensions?: HypeupExtension[]` parameter
- [ ] 1.4 Implement alias merging: iterate each extension's aliases, look up target in table (throw if not found), check for collision (throw if exists), insert same Primitive entry under alias key
- [ ] 1.5 Implement constant merging: iterate each extension's constants, check for collision (throw if exists), insert `{ kind: "constant", cssName, value }` entry
- [ ] 1.6 Re-export `HypeupExtension` type from `packages/babel/src/index.ts`

## 2. Babel Plugin

- [ ] 2.1 Update `hypeupBabelPlugin()` to accept optional options parameter `{ extensions?: HypeupExtension[] }` and pass `extensions` to `buildDslPrimitives()`
- [ ] 2.2 Add `case "constant"` to `handlePrimitive()` switch, calling new `handleConstant()` function
- [ ] 2.3 Implement `handleConstant()`: if parent is CallExpression and identifier is callee, skip; otherwise replace with `helperCall(path, cache, "prop", [stringLiteral(cssName), stringLiteral(value)])`

## 3. Unplugin Integration

- [ ] 3.1 Add `extensions?: HypeupExtension[]` to `HypeupPluginOptions` in `packages/plugin/src/unplugin.ts`
- [ ] 3.2 Pass `extensions` to `buildDslPrimitives()` when building the pre-scan identifier set
- [ ] 3.3 Pass `extensions` to `hypeupBabelPlugin()` in the transform call

## 4. Tests

- [ ] 4.1 Add helper to create plugin with extensions option for test transforms
- [ ] 4.2 Add tests for alias of CSS property (call form and keyword access)
- [ ] 4.3 Add tests for alias of builtin (`cc` -> `className`)
- [ ] 4.4 Add tests for alias of HTML element (`d` -> `div`)
- [ ] 4.5 Add tests for bare constant expansion (`m4` -> `prop("margin", "4px")`)
- [ ] 4.6 Add test for constant inside element children (`div(m4)`)
- [ ] 4.7 Add test for constant in call position NOT transformed (`m4("8px")`)
- [ ] 4.8 Add tests for scope shadowing of aliases and constants
- [ ] 4.9 Add test for invalid alias target throws
- [ ] 4.10 Add test for collision with built-in throws
- [ ] 4.11 Add test for collision between extensions throws
- [ ] 4.12 Add test for multiple extensions aggregating symbols
