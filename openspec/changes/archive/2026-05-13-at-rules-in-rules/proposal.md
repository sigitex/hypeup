## Why

`Rule.add()` (via `classifyRule`) currently accepts `Property | Rule | array` and silently drops `AtRule` instances. This means authors cannot scope media queries, container queries, or other conditional at-rules to a selector — a common CSS authoring pattern. The at-rule content is silently lost, which is a correctness bug with no error feedback.

## What Changes

- Extend `classifyRule` to recognize `AtRule` instances as valid rule content, collecting them into a new `atRules` slot
- Extend `renderRule` to hoist collected at-rules out of the rule context, re-wrapping the parent's fully-composed selector inside the at-rule block
- The rendered output is flat, standards-compliant CSS (no browser-native nesting) — the hoisting happens at render time

## Capabilities

### New Capabilities
- `at-rule-hoisting`: Support for `AtRule` content inside `Rule`, with automatic hoisting and selector re-wrapping during rendering

### Modified Capabilities

## Impact

- `@hypeup/runtime` — `classify.ts`: `walkRule` and `RuleSlots` gain an `atRules` slot
- `@hypeup/render` — `render.ts`: `renderRule` emits hoisted at-rule blocks with the parent selector
- `@hypeup/vdom` — no structural changes to `Rule` or `AtRule` classes (contents are already generic)
- Existing tests unaffected — currently no at-rules pass through rule classification, so adding the branch is purely additive
