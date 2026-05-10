## Why

CSS rules often target HTML element selectors (`pre`, `code`, `table`, etc.). Currently, hypeup's `rule()` only accepts string selectors like `rule("pre", ...)`. Since element names like `pre` and `code` are already DSL globals recognized by the babel plugin, it would be natural and ergonomic to write `rule(pre, ...)` instead of `rule("pre", ...)`, keeping the DSL consistent — you use the same identifier to create an element and to target it in a CSS rule.

## What Changes

- The babel plugin's `rule()` call handler gains element-selector detection: when the first argument to `rule()` is an identifier that maps to an HTML element in the primitive table, it SHALL be replaced with a string literal of the element's tag name at compile time.
- `rule(pre, color("red"))` compiles to `rule("pre", [color("red")])` — the runtime `rule` helper receives a string as before, no runtime changes needed.
- Compound selectors remain strings: `rule("pre code", ...)` is unchanged.
- `rule.active(...)` dot-syntax is unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `babel-plugin`: The `rule()` call form handler must detect HTML element identifiers as the first argument and convert them to tag name string literals.

## Impact

- **`@hypeup/babel`**: `hypeupBabelPlugin.ts` — the `rule()` call form handler (around line 406-417) needs to check if `args[0]` is an identifier in the primitive table with `kind: "htmlElement"` and replace it with `t.stringLiteral(primitive.tag)`.
- **`@hypeup/runtime`**: No changes — `rule()` helper already accepts a string.
- **`@hypeup/vdom`**: No changes.
- **No breaking changes.** String selectors continue to work. This is purely additive.
