## 1. Page Discovery — New Glob and Route Mapping

- [x] 1.1 Define `TARGET_FORMATS = ["html", "css", "md"]` constant in `discover.ts`
- [x] 1.2 Change glob pattern from `**/*.page.ts` to `**/*.{html,css,md}.*`
- [x] 1.3 Update `mapRoute` to strip the final (source) extension instead of replacing `.page.ts` with `.html`
- [x] 1.4 Verify `extractParams` still works with new route format (`[slug].html` instead of `[slug].html`)
- [x] 1.5 Ensure `node_modules/` and `.git/` exclusions still apply

## 2. Generate Command — Build and Render Pipeline

- [x] 2.1 Update SSR build input key generation (`page.route.replace(/\.html$/, "")`) to handle non-HTML routes (strip any target format extension)
- [x] 2.2 Update SSR module path lookup to match Vite's output naming for non-HTML inputs
- [x] 2.3 Verify `render()` produces correct output for CSS rule trees (no HTML wrapping)
- [x] 2.4 Verify `render()` produces correct output for raw text/markdown content

## 3. Watch Mode — Dev Server Updates

- [x] 3.1 Update URL-to-route matching in dev server middleware to handle `.css` and `.md` routes
- [x] 3.2 Set `Content-Type` header based on target format (`text/html`, `text/css`, `text/markdown`)
- [x] 3.3 Skip `transformIndexHtml` for non-HTML responses (CSS/MD don't need Vite's HTML injection)

## 4. Tests

- [x] 4.1 Update existing discovery tests for new glob pattern and route mapping
- [x] 4.2 Add test: `index.html.ts` discovered and mapped to `index.html`
- [x] 4.3 Add test: `styles.css.ts` discovered and mapped to `styles.css`
- [x] 4.4 Add test: `readme.md.ts` discovered and mapped to `readme.md`
- [x] 4.5 Add test: `data.json.ts` NOT discovered (not in allowlist)
- [x] 4.6 Add test: `helpers.ts` NOT discovered (single extension)
- [x] 4.7 Add test: `index.page.ts` NOT discovered (old convention)
- [x] 4.8 Add test: `[slug].html.ts` param extraction works
- [x] 4.9 Add generate test: CSS file output from rule nodes
- [x] 4.10 Add generate test: mixed HTML + CSS output in same build
