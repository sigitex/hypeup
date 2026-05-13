## Why

Hypeup's CSS rule nesting currently uses SCSS-style flattening — a child `rule` inside a parent `rule` gets its selector prefixed with the parent's selector and emitted as a separate top-level rule. This is useful for `&`, `:`, `>`, `+`, `~` combinators, but there's no way to emit actual CSS nesting (child rules rendered inline inside the parent's braces). Native CSS nesting is now well-supported in browsers (Chrome 120+, Firefox 117+, Safari 17.2+) and is needed for certain use cases where flattened output doesn't produce the correct behavior.

## What Changes

- A new selector prefix `/` signals that a nested rule should be rendered **inline** inside the parent rule block (native CSS nesting) rather than flattened SCSS-style.
- `rule("/.child", color("blue"))` inside a parent rule renders as `.child { color: blue; }` within the parent's braces.
- The existing SCSS-style flattening (bare selectors, `&`, `:`, `>`, `+`, `~`) is unchanged — `/` is purely additive.
- The `/` prefix is stripped before emitting the selector in the output.
- The renderer's `renderRule` function gains a branch: when a child rule's selector starts with `/`, emit it inline instead of flattening.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `server-render`: `renderRule` must detect the `/` prefix on child rule selectors and render them inline within the parent block instead of flattening.

## Impact

- **`@hypeup/render`**: `render.ts` — `renderRule` gains `/`-prefix detection and inline rendering for nested rules.
- **`@hypeup/runtime`**: No changes — the classifier doesn't interpret selectors.
- **`@hypeup/vdom`**: No changes — `Rule` stores the selector as-is.
- **`@hypeup/babel`**: No changes — string selectors pass through unchanged.
- **No breaking changes.** Existing selectors don't start with `/`, so all current behavior is preserved.
