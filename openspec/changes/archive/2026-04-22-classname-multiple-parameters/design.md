## Context

The `className` helper in `runtime/src/helpers.ts` currently accepts a single string and returns a single `CssClass`. Users who want to apply multiple classes must call it multiple times: `className("foo"), className("bar")`. The classifier in `classify.ts` already handles multiple `CssClass` instances in an element's contents array, so the downstream processing is already variadic-ready.

The babel plugin emits one `className()` call per segment in element chains (e.g., `div.foo.bar(...)` produces two separate `className("foo")` and `className("bar")` calls). This compiler path does not need to change — the improvement targets hand-written `className` usage.

## Goals / Non-Goals

**Goals:**
- Allow `className` to accept 1 or more string arguments
- Return a `CssClass[]` array so multiple classes flatten naturally into element contents
- Maintain backward compatibility — single-arg calls continue to work

**Non-Goals:**
- Changing the babel plugin's compilation strategy for element chains
- Changing the `CssClass` class itself
- Supporting non-string arguments (objects, arrays, conditionals) — that's a different concern

## Decisions

### Return type: `CssClass[]` instead of `CssClass`

**Decision**: `className` will always return `CssClass[]`, even for a single argument.

**Rationale**: Returning a mixed type (`CssClass | CssClass[]`) based on argument count would complicate the type signature and downstream handling. The classifier already iterates contents arrays and flattens nested arrays, so returning `CssClass[]` works seamlessly. A single-element array is handled identically to a single `CssClass` by the existing array-flattening logic in `classifyElement`.

**Alternative considered**: Overloaded signatures returning `CssClass` for one arg and `CssClass[]` for multiple. Rejected — adds type complexity for no practical benefit since arrays flatten in content contexts.

### No changes to CssClass

Each `CssClass` continues to hold a single `name`. The `className` helper simply maps each argument to its own `CssClass` instance.

## Risks / Trade-offs

- **[Return type change]** → Code that explicitly types a variable as `CssClass` from a `className()` call will need to update to `CssClass[]`. Mitigated by the fact that `className` is almost always used inline in element contents where arrays flatten automatically.
- **[Array in content]** → The classifier must handle `CssClass[]` in contents. It already handles nested arrays via the `Array.isArray(item)` branch in `classifyElement`, so no change needed there.
