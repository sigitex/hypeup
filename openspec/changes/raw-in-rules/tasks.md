## 1. Runtime Classifier — Raw Support

- [ ] 1.1 Add `children: any[]` to `RuleSlots` type in `classify.ts`
- [ ] 1.2 Initialize `children: []` in `classifyRule`
- [ ] 1.3 Add `Raw` instanceof check to `walkRule` — push to `slots.children`
- [ ] 1.4 Add `Raw` instanceof check to `walkAtRule` — push to `slots.children` (alongside existing `Rule`/`AtRule` check)

## 2. Server Renderer — Raw in Rules

- [ ] 2.1 Update `renderRule` to destructure `children` from `classifyRule` result
- [ ] 2.2 After emitting properties in `renderRule`, iterate `children` and call `renderNode` on each within the rule braces
- [ ] 2.3 Verify `renderNode` in the `AtRule` case already handles `Raw` via `children` (it iterates `children` and calls `renderNode` — should work with no changes)

## 3. Tests

- [ ] 3.1 Add classifier test: `Raw` in rule contents routes to `children`
- [ ] 3.2 Add classifier test: `Raw` in atRule contents routes to `children`
- [ ] 3.3 Add render test: rule with `Raw` child emits text inline
- [ ] 3.4 Add render test: rule with only `Raw` children
- [ ] 3.5 Add render test: rule with properties, `Raw`, and nested rules together
- [ ] 3.6 Add render test: atRule with `Raw` child
