## Why

CSS values like lengths, colors, and URLs require string interpolation in hypeup markup (e.g., `"${value}px"`, `"rgb(${r}, ${g}, ${b})"`, `"url(${path})"`). This is noisy and error-prone. Providing global helper functions — `px(10)` returning `"10px"`, `rgb(255, 0, 0)` returning `"rgb(255 0 0)"` — eliminates interpolation boilerplate for the most common CSS value patterns. Additionally, the existing collision-avoidance convention uses underscore prefixes (`_var`, `_continue`) which are less discoverable; this change migrates to a `$` suffix convention.

## What Changes

- **Add CSS unit helper functions** as ambient globals. All units from css-tree's `lexer.units` (63 units across 7 categories: length, angle, time, frequency, resolution, flex, decibel). Each takes a numeric argument and returns a CSS value string (e.g., `px(10)` returns `"10px"`).
- **Add CSS color function helpers** as ambient globals: `rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`. Signatures mirror CSS function arguments with alpha as an optional last parameter. Each returns a CSS value string (e.g., `rgb(255, 0, 0)` returns `"rgb(255 0 0)"`).
- **Add `url` helper** as an ambient global. `url("image.png")` returns `"url(image.png)"`.
- **Migrate collision convention** from underscore prefix (`_name`) to dollar suffix (`name$`). Applies to existing JS-reserved-word collisions (`_var` HTML element, `_continue`/`_default`/`_super`/`_break` CSS properties) and new collisions introduced by units (`em$`, `q$`, `s$` vs HTML elements; `ex$`, `cap$`, `x$` vs CSS keywords; `in$` vs JS reserved word).

## Capabilities

### New Capabilities

- `css-value-helpers`: Generation and runtime implementation of CSS unit functions, color functions, and `url` helper as ambient globals.

### Modified Capabilities

- `lexicon-css-gen`: Collision convention changes from underscore prefix (`_continue`) to dollar suffix (`continue$`) for CSS property names that are JS reserved words.
- `lexicon-html-gen`: Collision convention changes from underscore prefix (`_var`) to dollar suffix (`var$`) for HTML element names that are JS reserved words.
- `lexicon-primitives-gen`: Primitive table entries updated to reflect new dollar-suffix names (`var$`, `em$`, etc.) and new unit/function primitives.

## Impact

- **`@hypeup/generate`**: `discoverCss.ts` and `discoverHtml.ts` — update `jsName` collision handling. New discovery logic for units (from `css-tree` `lexer.units`) and curated color function list. New generator output for unit/function declarations and implementations.
- **`@hypeup/lexicon`**: New generated file(s) for CSS value helpers. `css.gen.ts` and `html.gen.ts` regenerated with `$suffix` convention. `primitives.gen.ts` updated with new entries.
- **`@hypeup/babel`** (or equivalent): Primitive table updated for new globals and renamed collision symbols.
- **Not breaking within hypeup**: The framework is experimental and the `_prefix` convention has no external consumers. The rename is safe.
