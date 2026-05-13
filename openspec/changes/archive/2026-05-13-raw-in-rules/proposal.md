## Why

`Raw` nodes are silently dropped when used inside `rule()` or `atRule()` contexts. The runtime classifier's `walkRule` only handles `Property` and `Rule`, and `walkAtRule` only handles `Property`, `Rule`, and `AtRule`. This means `raw()` — the escape hatch for injecting arbitrary text — doesn't work where it's arguably most needed: injecting raw CSS inside rule blocks (e.g., vendor-specific syntax, CSS hacks, or content the DSL can't express).

## What Changes

- `walkRule` in `classify.ts` gains `Raw` handling — `Raw` nodes are pushed to a new `children` slot on `RuleSlots`.
- `walkAtRule` in `classify.ts` gains `Raw` handling — `Raw` nodes are pushed to the existing `children` slot on `AtRuleSlots`.
- `renderRule` in `render.ts` emits `Raw` text inline within the rule block, alongside properties.
- No changes to the babel plugin, vdom types, or user-facing API — `raw()` already exists and is importable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `runtime-classifier`: `walkRule` and `walkAtRule` must accept `Raw` nodes instead of silently dropping them.
- `server-render`: `renderRule` must emit `Raw` children inline within rule blocks.

## Impact

- **`@hypeup/runtime`**: `classify.ts` — `walkRule` and `walkAtRule` gain `Raw` handling. `RuleSlots` type gains a `children` array (or `Raw` nodes added to existing structure).
- **`@hypeup/render`**: `render.ts` — `renderRule` emits `Raw` text within the rule block.
- **No breaking changes.** `Raw` nodes were previously silently ignored; now they render.
