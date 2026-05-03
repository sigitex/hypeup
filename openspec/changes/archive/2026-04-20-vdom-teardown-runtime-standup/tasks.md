## 1. Vdom Node Simplification

- [x] 1.1 Rewrite `Element` class: remove `add()`, `attributes`, `properties`, `children` fields; store raw `contents`
- [x] 1.2 Rewrite `Rule` class: remove `add()`, `properties`, `rules` fields; store raw `contents`; accept only `string` selector
- [x] 1.3 Rewrite `AtRule` class: remove `add()`, `properties` field; store raw `contents`
- [x] 1.4 Create `CssClass` node class (`name: string`)
- [x] 1.5 Create `Attr` node class (`name: string`, `value: Content`)
- [x] 1.6 Move node files from `vdom/src/nodes/` up to `vdom/src/`
- [x] 1.7 Delete `vdom/src/nodes/` directory
- [x] 1.8 Delete `vdom/src/nodes/ElementBuilder.ts`
- [x] 1.9 Delete `vdom/src/factories/` directory entirely
- [x] 1.10 Update `vdom/src/index.ts` to export all node classes from flat layout (no factories)
- [x] 1.11 Update `vdom/src/types.d.ts` if needed

## 2. Create `@hypeup/runtime` Package

- [x] 2.1 Create `runtime/` directory with `package.json` (`@hypeup/runtime`, depends on `@hypeup/vdom` and `cssesc`)
- [x] 2.2 Create `runtime/tsconfig.json`
- [x] 2.3 Create helper functions: `elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `atRule`, `className`
- [x] 2.4 Create `cssString` helper (using `cssesc`)
- [x] 2.5 Create `classifyElement(contents, isVoid)` returning `{ attributes, properties, classes, children }`
- [x] 2.6 Create `classifyRule(contents)` returning `{ properties, rules }`
- [x] 2.7 Create `classifyAtRule(contents)` returning `{ properties, children }`
- [x] 2.8 Create `runtime/src/index.ts` exporting all helpers, classifiers, and re-exporting node classes
- [x] 2.9 Install `cssesc` dependency in runtime package
- [x] 2.10 Run `bun install` to wire up workspace links

## 3. Update `@hypeup/render`

- [x] 3.1 Add `@hypeup/runtime` as a dependency of `@hypeup/render`
- [x] 3.2 Update `render.ts` Element branch: replace `x.attributes`/`x.properties`/`x.children` reads with `classifyElement(x.contents, x.isVoid)` call
- [x] 3.3 Update `render.ts` Rule branch: replace `rule.properties`/`rule.rules` reads with `classifyRule(rule.contents)` call
- [x] 3.4 Update `render.ts` AtRule branch: replace `atRule.properties`/`atRule.contents` reads with `classifyAtRule(atRule.contents)` call
- [x] 3.5 Update render imports (add runtime classifier imports, keep vdom node imports)

## 4. Tests

- [x] 4.1 Create test file(s) for vdom node constructors: Element, Rule, AtRule, CssClass, Attr, Property, Raw preserve fields correctly
- [x] 4.2 Create test file(s) for `classifyElement`: Property/Attr/CssClass/Element/Raw/string/object/array routing, void suppression, empty value skipping, class splitting from `{class: "..."}` objects
- [x] 4.3 Create test file(s) for `classifyRule`: Property/Rule routing, array flattening, empty skipping
- [x] 4.4 Create test file(s) for `classifyAtRule`: Property/Rule routing, array flattening
- [x] 4.5 Create test file(s) for render output: elements (with attributes, properties, classes, children), void elements, rules (basic, nested, element-selector), at-rules, Raw passthrough, Attr nodes, CssClass nodes
- [x] 4.6 Run full test suite, verify all pass

## 5. Cleanup & Verification

- [x] 5.1 Run type check (`tsc --noEmit`) across affected packages
- [x] 5.2 Verify no remaining references to deleted factories, `ElementBuilder`, or `add()` methods
- [x] 5.3 Verify `@hypeup/vdom` has no `cssesc` dependency
