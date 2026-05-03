## Why

The `@hypeup/runtime` helper functions (`className`, `attr`, `prop`, `raw`, `elem`, `elemVoid`, `cssString`, `doctype`) are intended to be ambient globals — usable without imports, just like the HTML element and CSS property globals. The babel plugin already handles the runtime transform (rewriting bare references to imports from `@hypeup/runtime`), and `primitives.d.ts` declares the TypeScript globals.

The `on` and `reactive` functions should also be global in this way. The point here is to avoid importing the most common stuff.

However, `primitives.d.ts` is a standalone ambient declaration file that isn't part of the import chain. When a consumer package (e.g., `@hypeup/todomvc`) does `import "@hypeup/lexicon"`, TypeScript follows the import graph: `index.ts` → `html.gen.ts`, `css.gen.ts`, `primitives.ts`. The HTML/CSS globals work because their `declare global` blocks are inside `.gen.ts` files that ARE imported. But `primitives.d.ts` is never imported — it just sits next to the other files, invisible to TypeScript in consumer projects.

This forces consumers to use `new CssClass("foo")` instead of `className("foo")`, import `CssClass` from `@hypeup/vdom`, and break the DSL's ambient-global convention.

## What Changes

Move the global type declarations for runtime helpers from `primitives.d.ts` (standalone ambient file) into a file that's part of the import chain, so they're visible to any package that imports `@hypeup/lexicon`.

## Capabilities

### Modified Capabilities

- `lexicon-primitives`: Move helper global declarations into the import chain so they're reachable from consumer packages

## Impact

- **@hypeup/lexicon**: `primitives.d.ts` declarations merged into an imported file (e.g., inline in `primitives.ts` or a new `helpers.gen.ts`)
- **@hypeup/todomvc**: Replace `new CssClass(...)` with `className(...)`, remove `CssClass` imports from `@hypeup/vdom`
- **No runtime changes** — the babel plugin and runtime helpers are already correct
