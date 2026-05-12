## Why

The `*.page.ts` file convention is opaque — it doesn't tell you what the file produces. Replacing it with a double-extension convention like `*.html.ts` makes the output format self-documenting and enables support for non-HTML output (CSS stylesheets, markdown documents) through the same pipeline. The source language extension is a wildcard, allowing `.ts`, `.js`, `.civet`, or any other language the build tool supports.

## What Changes

- **BREAKING**: The `*.page.ts` glob pattern is replaced with `**/*.{html,css,md}.*`. Files are discovered by their target format (the middle extension), not by a `.page` suffix.
- **Route mapping** changes: strip the source extension to derive the output path. `index.html.ts` → `index.html`, `styles.css.civet` → `styles.css`, `readme.md.ts` → `readme.md`.
- **Unified render pipeline**: All discovered files go through the same path — import module, call default export, pass through `render()`, write output. No branching by output format.
- **Allowlisted output formats**: Only `html`, `css`, and `md` are recognized as target formats. Other double-extension files are ignored.
- **Dynamic route params** continue to work: `[slug].html.ts` → `[slug].html`.
- **Watch mode** (dev server) updated to match the new conventions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `page-discovery`: New glob pattern `**/*.{html,css,md}.*`, new route mapping logic, source-language-agnostic.
- `generate-command`: Unified pipeline handles html/css/md output via the same `render()` path.

## Impact

- **`@hypeup/cli`**: `discover.ts` — new glob pattern, new `mapRoute` logic. `generate.ts` — render pipeline unchanged (already uses `render()` for everything). `vite.ts` — dev server URL matching updated.
- **User projects**: All `*.page.ts` files must be renamed to `*.html.ts`. **BREAKING**.
- **No new dependencies.**
