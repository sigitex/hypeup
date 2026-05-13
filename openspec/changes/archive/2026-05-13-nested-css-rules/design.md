## Context

The renderer's `renderRule` function currently processes child rules by flattening — it prepends the parent selector to the child selector (with SCSS-like `&`, `:`, space logic) and emits them as separate top-level rules. There is no path for emitting a child rule inline inside the parent's braces.

The `/` prefix was chosen because it is not a valid CSS selector start character, so it's unambiguous as a DSL convention. It sits alongside the existing prefix conventions: `&` (append without space), `:` (pseudo-class shorthand), and bare selectors (descendant combinator via flattening).

## Goals / Non-Goals

**Goals:**
- `/`-prefixed child rules render inline inside the parent block (native CSS nesting).
- The `/` is stripped from the output selector.
- Existing SCSS-style flattening is completely unchanged for non-`/` selectors.
- Works for any selector after the `/`: `/.child`, `/&:hover`, `/ > .child`, etc.

**Non-Goals:**
- Automatic detection of "should this nest or flatten" — the user explicitly opts in with `/`.
- Client-side CSS handling — this is SSR render only.
- Deeply nested `/` rules (nested inside nested) — should work naturally since `renderRule` is recursive, but not a primary design goal to optimize for.

## Decisions

### 1. Detect `/` prefix in `renderRule` when iterating child rules

In `renderRule`, when processing the `rules` array from `classifyRule`, check if each child rule's selector starts with `/`. If so:
- Strip the `/` prefix.
- Render the child rule inline (call `renderRule` recursively with no `prefix` argument, emitting inside the current rule's braces).

If not, use existing flattening behavior.

**Rationale:** Minimal change — a single `if` branch in the existing loop. The recursive `renderRule` call handles properties and further nesting naturally.

### 2. Emit nested rules after properties, inside the braces

The inline nested rule is emitted after the parent's properties but still inside the parent's `{...}` block. This matches how native CSS nesting works.

**Rationale:** CSS parsers expect nested rules after declarations within a rule block.

### 3. No changes to `Rule` vdom node or classifier

The `/` prefix is just a string convention in the selector. The classifier passes selectors through as-is. The renderer is the only component that interprets it.

**Rationale:** Keeps the change surface to a single file (`render.ts`).

## Risks / Trade-offs

- **[Risk] `/` in middle of selector could cause issues** -> Mitigation: only check `startsWith("/")`. Selectors with `/` elsewhere (unlikely but possible in attribute selectors like `[href="/"]`) are unaffected since they don't start with `/`.
- **[Trade-off] The `/` convention is hypeup-specific** -> Users need to learn it, but it's consistent with the existing `&`/`:` prefix conventions. Self-documenting once you know the pattern.
