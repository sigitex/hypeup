## Context

The hypeup DSL exposes HTML elements and CSS properties as ambient globals that the babel plugin rewrites to runtime calls. Boolean HTML attributes (e.g., `checked`, `disabled`, `hidden`) currently require the `attr()` escape hatch: `attr("checked", true)`. This is inconsistent with the zero-import, bare-identifier design of the rest of the DSL.

There are 42 standard boolean HTML attributes. Of these, `default` is a JS reserved word and only applies to `<track>` — it is excluded. `async` collides with a JS contextual keyword and uses the `$` suffix convention (`async$`) from `css-value-helpers`. The remaining 40 use their bare names. None collide with existing HTML tags, CSS properties, at-rules, or builtins.

## Goals / Non-Goals

**Goals:**
- Expose 41 boolean HTML attributes as ambient global constants of type `Attr`.
- Each bare reference compiles to `attr("name", true)` via the babel plugin.
- Discover boolean attributes from a data source (not hardcoded in the babel plugin).
- Follow existing generation, lexicon, and babel plugin patterns.

**Non-Goals:**
- Callable form (`checked(value)`) — these are bare-only, matching boolean semantics.
- Non-boolean enumerated attributes (e.g., `contenteditable`, `draggable`, `spellcheck`).
- Conditional attribute helpers — the `&&` short-circuit pattern (`isReady && checked`) is sufficient since the renderer already drops `false`.

## Decisions

### 1. Hardcode the boolean attribute list in discoverHtml

No npm package provides a curated boolean-attributes-only list. The HTML spec defines these explicitly and the set is extremely stable (additions are rare — last significant addition was `inert`). A hardcoded array in `discoverHtml.ts` is simpler than parsing the spec.

**Alternative considered:** Scraping from MDN or webref. Rejected — boolean-ness is not reliably machine-extractable from these sources, and the list is small and stable enough to maintain manually.

### 2. Bare-only, not callable

Boolean attributes have presence/absence semantics — they are either present or not. Making them callable (`checked(value)`) would conflate them with `attr()` which already handles the dynamic case. Bare-only keeps the mental model clean: `checked` means "this attribute is present."

Conditional usage: `isReady && checked` — the renderer drops `false` (confirmed in `render.ts:33`).

### 3. New primitive kind `booleanAttr`

A new kind rather than reusing `builtin`/`escapeHatch` because the rewrite behavior is unique: bare references (not calls) are replaced with `attr("name", true)` call expressions. Existing kinds don't have this "bare reference → function call" pattern.

**Alternative considered:** Reusing `escapeHatch` with special-case logic. Rejected — escape hatches are auto-imports, not call-generating transforms.

### 4. Exclude `default`, use `async$` for `async`

`default` is a JS reserved word (cannot be a bare identifier) and only applies to `<track>` — low value, high cost. Excluded entirely.

`async` is a contextual keyword that can technically be used as an identifier in some positions, but is fragile. The `$` suffix convention from `css-value-helpers` handles this cleanly: `async$` compiles to `attr("async", true)`.

### 5. Generate into existing files, not a new gen file

Boolean attribute declarations go into `html.gen.ts` (they're HTML-related globals) and boolean attribute data goes into `primitives.gen.ts` (it's primitive table data). This follows the existing pattern rather than adding a new generated file.

**Alternative considered:** A new `boolean-attrs.gen.ts`. Rejected — unnecessary file proliferation for a small addition that fits naturally into existing files.

## Risks / Trade-offs

- **[Trade-off] 41 more globals** — Increases global namespace. Acceptable given the DSL already has ~1000 globals (115 HTML tags, 813 CSS properties, 49 at-rules, 14 builtins).
- **[Trade-off] Common variable name shadowing** — Names like `disabled`, `checked`, `hidden` are common variable names. The babel plugin's scope-binding check already handles this correctly (locally bound names are not intercepted). Authors who want both the variable and the attribute can rename their variable.
- **[Risk] Hardcoded list may drift from spec** — New boolean attributes added to HTML would need manual addition. Mitigated by the extreme stability of this list — additions are very rare.
