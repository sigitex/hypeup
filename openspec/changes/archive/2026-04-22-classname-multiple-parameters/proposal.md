## Why

The `className` helper currently accepts only a single string, forcing users to call it multiple times when applying multiple classes to an element. This is verbose — e.g., `className("foo"), className("bar")` — when a simpler `className("foo", "bar")` would suffice. Variadic support reduces boilerplate and aligns with how developers think about applying classes.

## What Changes

- `className` helper signature changes from `(name: string) => CssClass` to `(...names: string[]) => CssClass[]` (or flattened into the content array)
- The global type declaration in `lexicon/src/primitives.ts` updates to match
- The babel plugin continues to emit one `className()` call per class segment in element chains, so no compiler change is needed for that path — but the runtime helper itself becomes more flexible for hand-written usage
- The classifier already handles multiple `CssClass` items in a contents array, so no changes needed there

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `runtime-helpers`: The `className` helper requirement changes from accepting a single string to accepting 1 or more strings

## Impact

- **Runtime**: `runtime/src/helpers.ts` — `className` function signature and implementation
- **Types**: `lexicon/src/primitives.ts` — global `className` declaration
- **Tests**: `babel/src/__tests__/plugin.test.ts` — may need additional test cases for multi-arg className
- **Spec**: `openspec/specs/runtime-helpers/spec.md` — requirement update via delta spec
- **Downstream**: Non-breaking — existing single-arg calls remain valid
