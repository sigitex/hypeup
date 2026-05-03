## 1. Runtime: classifyRule changes

- [ ] 1.1 Add `atRules: AtRule[]` to the `RuleSlots` type in `packages/runtime/src/classify.ts`
- [ ] 1.2 Initialize `atRules: []` in `classifyRule`'s slots object
- [ ] 1.3 Add `AtRule` branch to `walkRule`: push `AtRule` instances into `slots.atRules`
- [ ] 1.4 Add classify tests: single at-rule, mixed contents, at-rule nested in array, empty at-rules array when none present

## 2. Render: at-rule hoisting in renderRule

- [ ] 2.1 Update `renderRule` to destructure `atRules` from `classifyRule` result
- [ ] 2.2 After emitting nested rules, loop over `atRules` and emit each: write at-rule header, then render a new `Rule(composedSelector, atRule.contents)` inside the block
- [ ] 2.3 Handle comma-separated selectors: join all composed selectors when wrapping inside the at-rule

## 3. Render tests

- [ ] 3.1 Test: simple rule with media query → `.card{color:red}@media (min-width: 600px){.card{padding:20px}}`
- [ ] 3.2 Test: nested rule with at-rule → composed selector `.card .child` inside at-rule
- [ ] 3.3 Test: rule with multiple at-rules of different kinds (media + supports)
- [ ] 3.4 Test: comma-separated selectors with at-rule
- [ ] 3.5 Test: at-rule body with nested rule inside
- [ ] 3.6 Test: rule with properties, nested rule, and at-rule — verify emission order

## 4. Verify existing tests pass

- [ ] 4.1 Run full test suite to confirm no regressions
