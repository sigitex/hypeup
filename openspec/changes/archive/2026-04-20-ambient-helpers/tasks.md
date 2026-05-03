## 1. Move Global Declarations

- [x] 1.1 Update `lexicon/src/primitives.ts` — add `declare global` block with all helper type declarations (from `primitives.d.ts`), keeping the existing `export * from "./primitives.gen"` re-export
- [x] 1.2 Delete `lexicon/src/primitives.d.ts`

## 2. Update TodoMVC

- [x] 2.1 Replace `new CssClass(...)` with `className(...)` in `todomvc/src/TodoItem.ts`
- [x] 2.2 Replace `new CssClass(...)` with `className(...)` in `todomvc/src/FooterSection.ts`
- [x] 2.3 Remove `import { CssClass } from "@hypeup/vdom"` from all todomvc files

## 3. Verification

- [x] 3.1 Type-check todomvc passes (`tsc --noEmit`) — `className` resolves as a global
- [x] 3.2 Vite build succeeds
- [x] 3.3 Existing tests pass
