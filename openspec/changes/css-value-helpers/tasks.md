## 1. Migrate collision convention to $ suffix

- [ ] 1.1 In `discoverHtml.ts`, change the `keywords` collision handling from `_${name}` prefix to `${name}$` suffix
- [ ] 1.2 In `discoverCss.ts`, change the `keywords` set collision handling from `_${name}` prefix to `${name}$` suffix
- [ ] 1.3 Update the generator template for `html.gen.ts` to emit `$` suffix names
- [ ] 1.4 Update the generator template for `css.gen.ts` to emit `$` suffix names
- [ ] 1.5 Update the generator template for `primitives.gen.ts` to emit `$` suffix names
- [ ] 1.6 Regenerate all `.gen.ts` files and verify `var$`, `continue$`, `default$`, `super$`, `break$` appear correctly
- [ ] 1.7 Update babel plugin primitive table references from `_prefix` to `$suffix` names

## 2. Add unit discovery and generation

- [ ] 2.1 Create a `discoverValues.ts` in `@hypeup/generate` that imports `lexer` from `css-tree` and collects all units from `lexer.units`
- [ ] 2.2 Add collision detection: compare unit names against collected HTML element names, CSS property/keyword names, and JS reserved words; apply `$` suffix to colliders (`em$`, `q$`, `s$`, `ex$`, `cap$`, `x$`, `in$`)
- [ ] 2.3 Add the curated color function list (`rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`) with their signatures (3 required numbers + optional alpha)
- [ ] 2.4 Add `url` function entry (1 string argument)
- [ ] 2.5 Export a structured result containing units (with jsName, unit string, category) and functions (with jsName, css function name, param count)

## 3. Generate values.gen.ts

- [ ] 3.1 Add a generator step that produces `packages/lexicon/src/values.gen.ts` with a `declare global` block
- [ ] 3.2 Generate unit function declarations: `function <jsName>(value: number): string` for each unit
- [ ] 3.3 Generate color function declarations: `function <name>(c1: number, c2: number, c3: number, a?: number): string` for each color function
- [ ] 3.4 Generate `url` declaration: `function url(value: string): string`
- [ ] 3.5 Add doc comments with unit category and spec reference (e.g., `/** px — length unit. css-values-4 */`)

## 4. Update primitives.gen.ts

- [ ] 4.1 Add `cssUnits` export mapping JS names to unit strings (e.g., `{ px: "px", em$: "em", in$: "in" }`)
- [ ] 4.2 Add `cssFunctions` export mapping JS names to CSS function names (e.g., `{ rgb: "rgb", hsl: "hsl", url: "url" }`)

## 5. Add runtime implementations

- [ ] 5.1 Add unit helper implementations (each returns `${value}${unit}`) — either in runtime package or as babel compile-time transforms
- [ ] 5.2 Add color function implementations (each returns `${name}(${args.join(' ')})` with `/ alpha` when present)
- [ ] 5.3 Add `url` implementation (returns `url(${value})`)

## 6. Update babel plugin

- [ ] 6.1 Register unit globals in the babel plugin's primitive recognition (using `cssUnits` from primitives)
- [ ] 6.2 Register color function and `url` globals in the babel plugin's primitive recognition (using `cssFunctions` from primitives)
- [ ] 6.3 Ensure the plugin transforms unit/function calls to string literals at build time where arguments are static

## 7. Validate

- [ ] 7.1 Run the generator (`bun run generate` in `packages/lexicon`) and verify output
- [ ] 7.2 Type-check lexicon package (`bun run check`)
- [ ] 7.3 Type-check babel package (`bun run check`)
- [ ] 7.4 Run existing tests to ensure nothing breaks
- [ ] 7.5 Verify no `_var` or `_continue` references remain in generated output
