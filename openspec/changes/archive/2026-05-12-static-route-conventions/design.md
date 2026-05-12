## Context

The CLI's page discovery (`discover.ts`) currently globs for `**/*.page.ts`, strips `.page.ts`, and appends `.html` to produce the output route. The generate command (`generate.ts`) imports each discovered module, calls the default export, passes the result through `render()`, and writes the output.

The new convention uses double-extensions where the middle extension is the target format: `index.html.ts`, `styles.css.ts`, `readme.md.ts`. The source extension (`.ts`, `.civet`, etc.) is stripped; the rest becomes the output path.

## Goals / Non-Goals

**Goals:**
- Discovery globs for `**/*.{html,css,md}.*` with allowlisted target formats.
- Route mapping strips only the final (source) extension.
- The render pipeline is unchanged — `render()` handles all output formats since it already processes HTML elements, CSS rules, and raw text.
- Watch mode serves all discovered files correctly.
- Dynamic route params (`[slug].html.ts`) continue to work.

**Non-Goals:**
- Non-importable source files (e.g., `.md` as a source language) — out of scope.
- Content-type-aware serving in dev mode — all served as their target format's MIME type if needed, but not critical for initial implementation.
- New output formats beyond html/css/md — future extensions to the allowlist.

## Decisions

### 1. Allowlisted target formats as a constant

Define `const TARGET_FORMATS = ["html", "css", "md"]` in `discover.ts`. The glob pattern is built from this list: `**/*.{html,css,md}.*`. Adding a new format is a one-line change.

**Rationale:** Explicit allowlist prevents accidental discovery of non-page files. Wildcard (`**/*.*.*`) was considered and rejected — too easy to accidentally match things like `tsconfig.base.json`.

### 2. Route mapping: strip the final extension

`mapRoute` changes from "strip `.page.ts`, append `.html`" to "strip the final extension." Implementation: find the last `.` and remove everything after it. `index.html.ts` → `index.html`, `styles.css.civet` → `styles.css`.

**Rationale:** Simple, predictable, works for any source extension without maintaining a list.

### 3. Param extraction unchanged

Dynamic params are still extracted from the route: `[slug].html.ts` → route `[slug].html` → params `["slug"]`. The `extractParams` function works on the route string, not the source filename, so it needs no changes.

### 4. Dev server content-type awareness

The dev server middleware should set `Content-Type` based on the target format — `text/html` for `.html`, `text/css` for `.css`, `text/markdown` for `.md`. Currently it hardcodes `text/html`.

**Rationale:** Browsers need correct MIME types, especially for CSS files loaded via `<link>`.

### 5. Vite SSR build input keys

The SSR build uses `page.route.replace(/\.html$/, "")` as input keys. This needs to generalize — strip any target format extension, or use the full route as the key. The output module filename also changes from `.mjs` lookup to match the new naming.

## Risks / Trade-offs

- **[Risk] Existing projects break** -> Mitigation: BREAKING change documented. Migration is a simple file rename `*.page.ts` → `*.html.ts`.
- **[Risk] Vite SSR build may produce unexpected module paths for non-HTML files** -> Mitigation: test with `.css.ts` and `.md.ts` files during implementation. The module naming just needs to match between build output and import.
