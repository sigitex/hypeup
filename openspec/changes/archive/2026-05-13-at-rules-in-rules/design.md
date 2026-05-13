## Context

The hypeup rendering pipeline processes a VDOM tree through classify → render stages. `classifyRule` in `@hypeup/runtime` walks a `Rule`'s contents and sorts them into `properties` (CSS declarations) and `rules` (nested Rules). `AtRule` instances are silently dropped because `walkRule` has no branch for them.

The renderer in `@hypeup/render` already handles `AtRule` at the top level and `Rule` nesting with selector composition (the `prefix` parameter in `renderRule`). The pieces exist — they just need to be connected.

Relevant files:
- `packages/runtime/src/classify.ts` — `walkRule`, `RuleSlots`
- `packages/render/src/render.ts` — `renderRule`

## Goals / Non-Goals

**Goals:**
- Allow `AtRule` as valid content inside a `Rule`
- Hoist at-rules out of the rule context at render time, re-wrapping the fully-composed parent selector inside the at-rule block
- Emit flat, standards-compliant CSS output
- Handle nested rules containing at-rules (composed selectors)

**Non-Goals:**
- Native CSS nesting (`&` syntax) emission — the renderer already handles `&` in selectors separately
- Merging adjacent at-rules with identical conditions (future optimization)
- Type-level restriction to only conditional at-rules (`@media`, `@supports`, `@container`) — start runtime-lenient
- Source-order guarantees in pathological nesting depths

## Decisions

### 1. Add `atRules: AtRule[]` to `RuleSlots`

`classifyRule` returns a `RuleSlots` object. Add an `atRules` array alongside `properties` and `rules`.

**Rationale**: Keeps the classify/render separation clean. The classifier collects; the renderer decides ordering. Alternative was storing at-rules inline with rules in a union array, but that complicates the render loop for no benefit.

### 2. Hoist at render time, not at classify time

`renderRule` will iterate `atRules` after emitting the rule's own declarations and nested rules. For each at-rule, it emits the at-rule wrapper and creates a new `Rule` with the parent's fully-composed selector wrapping the at-rule's contents.

**Rationale**: The classifier's job is sorting content by type. Selector composition is already a render concern (the `prefix` parameter). Hoisting in the renderer keeps responsibilities aligned. Alternative was having `classifyRule` produce pre-hoisted structures, but that would duplicate selector composition logic.

### 3. Reuse existing `renderNode` for at-rule body contents

The hoisted at-rule's body is rendered by constructing a `Rule(composedSelector, atRule.contents)` and passing it to `renderRule`. This automatically handles the case where the at-rule body contains properties, nested rules, or further at-rules.

**Rationale**: Avoids special-case rendering. The existing `renderRule` already handles selector composition recursively. The at-rule's contents are just rule contents that need a selector context.

### 4. At-rules emit after the rule's own declarations and nested rules

Output order for a rule: own properties → nested rules → hoisted at-rules. This matches the intuitive reading of the input (properties first, then responsive/conditional overrides).

**Rationale**: CSS specificity is not affected by source order for at-rules (they create their own scope). The order is a readability choice. Matching input order is the least surprising behavior.

## Risks / Trade-offs

- **[Silent acceptance of non-conditional at-rules]** → `@keyframes` or `@font-face` inside a rule will be hoisted with the selector wrapped, which is semantically wrong. Mitigation: start lenient (no crash), tighten types later if it becomes a footgun. The backlog explicitly chose this approach.
- **[No at-rule merging]** → Multiple `$media("(min-width: 600px)", ...)` inside the same rule produce duplicate `@media` blocks. Mitigation: correct behavior, just verbose. Merging is a separate optimization pass.
- **[Render order sensitivity]** → At-rules always emit after nested rules. If a user expects interleaved output, they won't get it. Mitigation: document the ordering. In practice, at-rule specificity makes interleaving irrelevant.
