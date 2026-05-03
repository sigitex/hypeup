## Context

The lexicon package has three imported files (`html.gen.ts`, `css.gen.ts`, `primitives.ts`) and one standalone ambient file (`primitives.d.ts`). The `.gen.ts` files use `declare global {}` blocks inside regular `.ts` files — these are picked up by TypeScript when the file is part of the import chain. `primitives.d.ts` uses the same pattern but isn't imported by anything, so consumer packages never see its declarations.

## Goals / Non-Goals

**Goals:**
- Make `className()`, `attr()`, `prop()`, `raw()`, `elem()`, `elemVoid()`, `cssString()`, and `doctype` available as TypeScript globals in any package that imports `@hypeup/lexicon`

**Non-Goals:**
- Changing the babel plugin or runtime helpers (already working correctly)
- Changing how the HTML/CSS globals work (already correct)

## Decisions

### 1. Move global declarations into `primitives.ts`

The `primitives.ts` file (which we created as a barrel re-exporting `primitives.gen.ts`) is already in the import chain via `lexicon/src/index.ts`. Add the `declare global {}` block from `primitives.d.ts` directly into `primitives.ts`.

This is the simplest fix — one file change, no new files, follows the same pattern as `html.gen.ts` and `css.gen.ts`.

**Alternative considered**: Creating a new `helpers.gen.ts` file. Rejected — unnecessary indirection. The declarations are small (8 functions + 1 const) and belong with the primitives.

**Alternative considered**: Adding `primitives.d.ts` to consumer tsconfigs via `references` or `paths`. Rejected — breaks the "just import lexicon and everything works" convention.

### 2. Remove standalone `primitives.d.ts`

After merging declarations into `primitives.ts`, delete `primitives.d.ts` to avoid confusion and duplication.

### 3. Update todomvc to use ambient helpers

Replace `new CssClass(...)` with `className(...)` throughout the todomvc code. Remove direct `CssClass` imports from `@hypeup/vdom`.

## Risks / Trade-offs

- **[Minimal risk]** — This is a straightforward file reorganization with no runtime behavior changes.
