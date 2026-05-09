## Context

The `hypeup` CLI package (`packages/cli`) is a stub that prints `"stub!"`. The framework already has a server-side renderer (`@hypeup/render`) that converts vdom trees to HTML strings. This design adds a `generate` subcommand that uses the existing renderer to produce static HTML files from hypeup page components.

The CLI runs on Bun. The monorepo uses Bun workspaces, so internal packages (`@hypeup/render`, `@hypeup/runtime`, `@hypeup/lexicon`) are available as workspace dependencies.

## Goals / Non-Goals

**Goals:**
- Provide a working `hypeup generate` subcommand that produces static HTML from page components
- Support conventional file-based routing (file path maps to output path)
- Use Vite internally for module loading and transform (leveraging `@hypeup/plugin`)
- Support `--watch` mode that re-generates on file changes
- Establish the CLI's argument parsing and subcommand routing pattern for future commands

**Non-Goals:**
- Dev server with HTTP serving or HMR (future work — but Vite foundation makes this easy to add)
- Incremental/differential builds (watch mode re-generates all pages)
- Client-side hydration or JS bundle output (SSG only — HTML files)
- Plugin system or middleware hooks
- CSS extraction to separate files (inline styles via render are sufficient for now)

## Decisions

### 1. Argument parsing: use `Bun.argv` with a minimal hand-rolled parser

**Rationale:** The CLI has exactly one subcommand with a small number of flags. A full argument parsing library (e.g., `commander`, `yargs`) adds a dependency for minimal benefit. Bun provides `Bun.argv` directly. A simple parser that extracts the subcommand and named flags is sufficient and keeps dependencies at zero.

**Alternative considered:** `commander` or `citty` — rejected because the CLI surface is small enough that a dependency is unnecessary. Can revisit when more subcommands are added.

### 2. Page discovery: glob-based file scanning in a pages directory

**Rationale:** Pages are discovered by scanning a source directory (default: `pages/`) for `.ts` and `.tsx` files. Each file must default-export a function that returns vdom content. The file path relative to the pages directory determines the output HTML path (e.g., `pages/about.tsx` → `dist/about.html`, `pages/blog/post.tsx` → `dist/blog/post.html`). Files named `index.tsx` produce `index.html` in their directory.

**Alternative considered:** Explicit route config file — rejected because convention-over-configuration is simpler for the common case and matches user expectations from frameworks like Next.js/Astro.

### 3. Page execution: hybrid — `vite.build()` for production, `ssrLoadModule` for watch

**Rationale:** The hypeup DSL requires a Babel transform before code can execute — bare identifiers like `div`, `span` etc. must be rewritten to runtime calls. The existing `@hypeup/plugin` (unplugin) already handles this for Vite. The CLI uses two different Vite mechanisms depending on the mode, following the same pattern as Astro:

- **One-shot `hypeup generate`**: Uses `vite.build()` in SSR mode with discovered pages as entry points. This compiles all page modules with transforms applied, handles asset imports (hashing, emission to output), and copies `public/` to the output directory automatically. The compiled modules are then imported, their default exports called, rendered to HTML, and written to disk.

- **Watch mode `hypeup generate --watch`**: Uses a Vite dev server in middleware mode with `ssrLoadModule()` for fast on-the-fly transforms. No build step — pages are loaded, transformed, and rendered on each change. `public/` is copied to the output directory manually. Asset imports resolve to dev-style paths (acceptable for development).

This hybrid gives production-correct output for builds and fast iteration for development, with a single transform pipeline (`@hypeup/plugin/vite`) underlying both.

**Alternative considered:** Using `ssrLoadModule` for both modes — rejected because asset imports don't work correctly (dev-server URLs in static output) and `public/` copying must be done manually. Using `vite.build()` for both — rejected because full rebuilds on every file change in watch mode are unnecessarily slow.

### 4. Output: thin render-to-disk, no document wrapping

**Rationale:** The CLI does not wrap rendered output in any document boilerplate — no `<!DOCTYPE html>`, no `<html>`, no `<head>`. The user already has `html`, `head`, `body` etc. available as first-class elements in the hypeup DSL and can compose full documents themselves using layout functions. The CLI is a thin tool: import page, call default export, render to string, write to file. This avoids magic and keeps the CLI simple. Document scaffolding features can be added later if needed.

**Alternative considered:** Auto-wrapping rendered content in a full HTML document with a special `head` export convention — rejected because users have full control of the document structure through the DSL already, and the added convention creates unnecessary coupling.

### 5. Watch mode: Vite watcher with full re-generate

**Rationale:** When `--watch` is passed, the CLI keeps the Vite server running and uses Vite's built-in file watcher to detect changes in the pages directory. On change, all pages are re-discovered and re-rendered. This is simple (no incremental/differential logic) and correct. Since SSG is just string rendering, full re-generation is fast enough for typical site sizes. The Vite server's module graph is invalidated on change so `ssrLoadModule` picks up fresh code.

**Alternative considered:** Bun's native `fs.watch` — rejected because Vite's watcher is already running and handles debouncing, glob patterns, and cross-platform edge cases.

### 6. CLI interface

```
hypeup generate [options]

Options:
  --pages <dir>    Source pages directory (default: "pages")
  --out <dir>      Output directory (default: "dist")
  --clean          Remove output directory before generating
  --watch          Watch for changes and re-generate
```

## Risks / Trade-offs

- **[Vite dependency weight]** → Adding Vite as a runtime dependency of the CLI is heavier than a pure-Bun approach. Mitigation: Vite is already used in the ecosystem (`@hypeup/plugin` targets it), provides the transform pipeline for free, and enables future dev server/HMR with minimal additional work.
- **[No incremental builds]** → Every `generate` run (and every watch re-generate) re-renders all pages. Mitigation: acceptable for initial implementation; SSG is just string rendering and is fast. Add incremental builds later if needed.
- **[No client JS]** → Output is pure HTML with no JavaScript. Mitigation: this is intentional for the SSG use case. Client-side interactivity is a separate concern (hydration) for a future change.
- **[Bun-only]** → The CLI uses Bun APIs (`Bun.glob`, `Bun.write`). Mitigation: hypeup already requires Bun across the monorepo, so this is not a new constraint.
