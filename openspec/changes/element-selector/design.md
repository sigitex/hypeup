## Context

The babel plugin's `handleEscapeHatch` function has a dedicated handler for `rule(...)` calls (lines 406-417 of `hypeupBabelPlugin.ts`). It takes `args[0]` as the selector and `args.slice(1)` as the contents. Currently it passes the selector through as-is — if the user writes `rule(pre, ...)`, the raw `pre` identifier is passed to the runtime `rule()` helper, which expects a string. This silently produces broken output.

The `buildTable()` lookup table already maps element names to their tag strings. The plugin has access to this table during transformation.

## Goals / Non-Goals

**Goals:**
- `rule(pre, ...)` compiles to `rule("pre", [...])` — element identifier becomes a tag name string literal.
- Works for all HTML elements in the primitive table (void and non-void).
- String selectors continue to work unchanged.

**Non-Goals:**
- Compound element selectors like `rule(pre, code, ...)` — use strings for compound selectors.
- Element class chains in rule selectors like `rule(pre.active, ...)` — out of scope, use `rule("pre.active", ...)`.
- Runtime changes — this is purely a compile-time transform.

## Decisions

### 1. Resolve element identifier to string literal at compile time

In the `rule()` call handler, before building the replacement AST, check if `args[0]` is an `Identifier` whose name exists in the primitive table with `kind: "htmlElement"`. If so, replace it with `t.stringLiteral(primitive.tag)`.

**Rationale:** This is the simplest approach — a 4-line addition to the existing handler. No new AST passes, no runtime changes. The table lookup is already O(1).

**Alternative considered:** Overloading the runtime `rule()` helper to accept an Element as the first arg and extract its tag. Rejected — adds runtime cost and complexity for something trivially solvable at compile time.

### 2. Use the primitive's `tag` field, not the identifier name

The table entry's `tag` field is used (not the identifier name) to handle the `_var` special case (`_var` maps to tag `"var"`).

**Rationale:** Consistency with how `handleHtmlElement` already uses `primitive.tag`.

## Risks / Trade-offs

- **[Risk] User writes `rule(div, ...)` intending `div` as a local variable** -> Mitigation: the plugin already skips locally-bound identifiers (`path.scope.getBinding(name)` check at line 103). However, in the `rule()` handler, the selector arg is not visited via the Identifier visitor — it's read from the call's arguments. The handler must perform its own table lookup on `args[0]`. If the identifier is locally bound, it should be left as-is. This needs explicit handling.
