## 1. @hypeup/babel Package Setup

- [x] 1.1 Create `@hypeup/babel` package with `package.json` (dependencies: `@babel/core`, `@babel/types`, `@babel/helper-module-imports`, `@hypeup/lexicon`)
- [x] 1.2 Create `tsconfig.json` extending workspace config

## 2. Primitive Table

- [x] 2.1 Implement `buildTable()` that imports from `@hypeup/lexicon/primitives` and builds an O(1) lookup `Map<string, Primitive>`
- [x] 2.2 Register htmlElement primitives (with isVoid from voidHtmlTags), atRule primitives, cssProperty primitives, and escape-hatch primitives
- [x] 2.3 Handle keyword collision mappings (_var -> var tag, etc.)

## 3. Core Babel Plugin

- [x] 3.1 Implement plugin entry point that builds primitive table at init and returns an `Identifier` visitor
- [x] 3.2 Implement scope-aware skip logic: `path.scope.getBinding(name)` non-null -> skip; non-reference position -> skip
- [x] 3.3 Implement import injection helper using `@babel/helper-module-imports` `addNamed()` — cached per-file, idempotent

## 4. Lowering Rules

- [x] 4.1 Implement HTML element lowering: bare call -> `elem(tag, [args])` / `elemVoid(tag, [args])`
- [x] 4.2 Implement class chain lowering: member-expression chain -> `elem(tag, [className(kebab(name)), ..., ...args])`
- [x] 4.3 Implement CSS property call-form lowering: `prop(kebabName, arg)`
- [x] 4.4 Implement CSS property keyword-access lowering: `prop(kebabName, kebabKeyword)` (covers color keywords too)
- [x] 4.5 Implement at-rule lowering: `atRule(keyword, ruleOrNull, contents)` with first-string-literal hoisting
- [x] 4.6 Implement rule lowering: call form, class-access form (kebabized), element-selector form
- [x] 4.7 Implement escape-hatch lowering: import from runtime; `doctype.html5` -> `raw("<!DOCTYPE html>")`

## 5. Kebab Utility

- [x] 5.1 Implement `kebab(camelCase)` utility for camelCase-to-kebab-case conversion

## 6. @hypeup/plugin Package Setup

- [x] 6.1 Create `@hypeup/plugin` package with `package.json` (dependencies: `unplugin`, `@babel/core`, `@babel/preset-typescript`, `@hypeup/babel`)
- [x] 6.2 Set up subpath exports for vite, esbuild, rollup, webpack, rspack

## 7. Unplugin Wrapper

- [x] 7.1 Implement unplugin factory with file filter (`/\.[jt]sx?$/`, exclude node_modules)
- [x] 7.2 Implement consumer project gate: check for `@hypeup/lexicon` in consumer's `package.json`
- [x] 7.3 Implement no-op short-circuit: cheap string scan for primitive identifiers before invoking Babel
- [x] 7.4 Wire up `babel.transformAsync()` with `sourceMaps: true` and `@babel/preset-typescript`
- [x] 7.5 Create subpath entry files for each bundler adapter

## 8. Testing

- [x] 8.1 Write snapshot tests for each lowering rule (HTML elements, class chains, CSS properties, at-rules, rule, escape hatches)
- [x] 8.2 Write snapshot tests for scope-shadowing skip cases
- [x] 8.3 Write tests for import injection (idempotent, minimal, collision-safe)
- [x] 8.4 Verify both packages compile with no TypeScript errors (`tsc --noEmit`)
