# hypeup

## Design constraints

- Avoiding needing to `import` any of the DSL primitives. This includes HTML elements, CSS properties, basics like `on`, `each`, and `reactive` - things that will be used in markup.

## Code generation

The `packages/lexicon` package contains generated files (`css.gen.ts`, `html.gen.ts`, `primitives.gen.ts`). To regenerate them, run `bun run generate` **in `packages/lexicon`** — not in `packages/generate` directly. The generate script writes output relative to the lexicon package's working directory.

## Repository structure

Packages have been moved from the top level into `packages/`. The workspace glob in `package.json` reflects this. When referencing package source paths, use `packages/<name>/src/...` not `<name>/src/...`. Archived openspec changes still use old top-level paths — that is intentional and should not be updated.

