## Context

The runtime classifier (`classify.ts`) sorts vdom node contents into typed slots. `walkRule` produces `{ properties, rules }` and `walkAtRule` produces `{ properties, children }`. Neither handles `Raw` nodes — they are silently ignored. The renderer (`render.ts`) consumes these slots, so `Raw` nodes inside rules never reach output.

Elements already support `Raw` via `walkElement`, which pushes them to `children`. The same pattern applies here.

## Goals / Non-Goals

**Goals:**
- `Raw` nodes inside `rule()` render their text inline within the rule block.
- `Raw` nodes inside `atRule()` render their text inline within the at-rule block.
- Existing behavior for `Property`, `Rule`, and `AtRule` children is unchanged.

**Non-Goals:**
- Client-side classify changes — `classify.ts` in `@hypeup/client` has its own classifier; that's a separate concern if needed.
- Validation of Raw content (e.g., checking for valid CSS) — `Raw` is an escape hatch, users are responsible for content.

## Decisions

### 1. Add `Raw` to `RuleSlots` via a `children` array

Currently `RuleSlots` has `properties` and `rules`. Add a `children: any[]` array (matching `AtRuleSlots`'s existing pattern). `Raw` nodes go into `children`. The renderer emits `children` inline after properties, before processing nested rules for flattening.

**Rationale:** Consistent with how `AtRuleSlots` already has a `children` array. Keeps the slot structure uniform.

**Alternative considered:** Push `Raw` into the `rules` array and handle polymorphically in `renderRule`. Rejected — mixing types in a typed array is confusing and makes the renderer logic harder to follow.

### 2. AtRule already has `children` — just add `Raw` to `walkAtRule`

`walkAtRule` already handles `Rule` and `AtRule` children. Adding `Raw` is a one-line instanceof check alongside the existing ones.

### 3. Render Raw inline within the rule braces

In `renderRule`, after emitting properties and before processing nested rules, iterate `children` and call `renderNode` on each. Since `renderNode` already handles `Raw` (emitting `x.text`), this requires no new rendering logic.

## Risks / Trade-offs

- **[Risk] Raw CSS inside a rule could produce invalid output** -> Mitigation: this is the nature of `raw()` — it's an escape hatch. The same risk exists for `raw()` in element contexts. No validation needed.
