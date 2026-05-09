# Proposal: Rule Dot-Syntax for Class Selectors

## Problem

The hypeup babel plugin already transforms `rule.active(...)` into `rule(".active", ...)` at compile time (see `hypeupBabelPlugin.ts:376-403`), and tests confirm this works (`plugin.test.ts:133-143`). However, the global TypeScript declaration for `rule` is a plain function signature:

```ts
function rule(selector: string, ...contents: Content[]): Rule
```

This means `rule.active(color.red)` compiles correctly via babel but produces a TypeScript type error because the type system doesn't know `rule` has arbitrary member access. Users either ignore the error or avoid the shorthand entirely.

## Solution

Change the `rule` type declaration from a bare `function` to a typed constant with both a call signature and an index signature, so that `rule.anyClassName(...)` is valid TypeScript:

```ts
const rule: {
  (selector: string, ...contents: Content[]): Rule
  [className: string]: (...contents: Content[]) => Rule
}
```

This makes both forms type-safe:
- `rule(".active", ...)` -- explicit string selector
- `rule.active(...)` -- dot-syntax shorthand

No runtime changes are needed since the babel plugin already handles the transform.

## Examples

**Before** (works at runtime, TypeScript error):
```ts
rule.active(color.red)         // TS error: Property 'active' does not exist
rule.activeItem(color.red)     // TS error
```

**After** (works at runtime, TypeScript valid):
```ts
rule.active(color.red)         // OK — transformed to rule(".active", color.red)
rule.activeItem(color.red)     // OK — transformed to rule(".active-item", color.red)
rule(".active", color.red)     // OK — explicit form still works
```

## Benefits

- Eliminates false TypeScript errors for an already-supported syntax
- Encourages use of the more concise dot-syntax form
- Zero runtime cost — purely a type declaration change
- Matches the existing pattern used by CSS properties (e.g., `color.red`)
