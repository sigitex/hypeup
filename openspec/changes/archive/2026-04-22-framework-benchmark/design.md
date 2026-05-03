## Context

The js-framework-benchmark (https://github.com/krausest/js-framework-benchmark) is a standardized suite with 186+ framework implementations. Each implementation lives in `frameworks/keyed/<name>/` or `frameworks/non-keyed/<name>/` and must:

1. Serve a page with specific button IDs (`run`, `runlots`, `add`, `update`, `clear`, `swaprows`)
2. Render a table with Bootstrap CSS classes and specific `<tr>` structure
3. Support `npm ci` and `npm run build-prod` for building
4. Include `js-framework-benchmark` metadata in `package.json`
5. Use the global CSS from `/css/currentStyle.css` (Bootstrap)
6. Include a preload span for glyphicons

hypeup uses a babel transform via Vite plugin to rewrite DSL globals into runtime calls. The benchmark app will be a standard Vite project using `@hypeup/plugin`. It depends on the `list-reconciliation` change (already implemented) which provides the `each()` primitive and keyed reconciler.

The implementation lives in a clone of the benchmark repo at `/sig/hypeup-bench`, directly at `frameworks/keyed/hypeup/`. This allows running the benchmark server, validation, and benchmarks in-place without copying files.

The vanillajs reference implementation uses direct DOM manipulation with event delegation. The benchmark rules note that implementations should be idiomatic for their framework, not over-optimized. Manual DOM manipulation gets note #772; explicit event delegation gets note #801.

## Goals / Non-Goals

**Goals:**
- Create a correct, idiomatic hypeup implementation that passes the benchmark's `isKeyed` validation
- Use `each()` with key functions for the row list (keyed mode)
- Use `reactive()` for application state (data array, selected row ID)
- Use hypeup's DSL for all markup (no manual DOM manipulation)
- Produce a production build via Vite that the benchmark harness can serve and test
- Structure the code so it can be copied into the benchmark repo and submitted as a PR

**Non-Goals:**
- Micro-optimizations that deviate from idiomatic hypeup usage (no manual DOM tricks, no explicit event delegation in app code)
- Running the full benchmark suite locally (requires chromedriver setup)
- Submitting the PR upstream in this change — just preparing the implementation

## Decisions

### 1. Keyed implementation (not non-keyed)

**Choice:** `frameworks/keyed/hypeup/` — each row has a stable key (`data.id`) and DOM nodes maintain 1:1 identity with data items.

**Rationale:** hypeup's `each()` with a key function is inherently keyed. Non-keyed mode (index-based) would use the two-argument `each()` overload, but keyed is the more interesting benchmark — it tests reconciler quality on swap/reorder operations.

### 2. Single-file app with separate store

**Choice:** Two source files: `src/store.ts` (data generation, state management) and `src/main.ts` (rendering, event wiring, mount).

**Rationale:** Matches the conventional benchmark structure. The store is a plain module with reactive state and mutation functions. The main file creates the DOM using hypeup's DSL. This separation is idiomatic for hypeup — state and view are separate concerns.

### 3. Reactive state via `reactive()` (not signals)

**Choice:** Use `reactive({ data: [], selected: 0 })` for the application state, not individual signals.

**Rationale:** hypeup's `reactive()` provides deep proxy-based tracking. The benchmark state is a simple object with a `data` array and `selected` number. `reactive()` is the idiomatic hypeup approach for this shape. The `each()` primitive will track `state.data` via the proxy, and per-row effects will track `row.label` and `state.selected`.

### 4. Row rendering via `each()` with per-row reactive class

**Choice:** Each row is rendered via `each(state.data, d => d.id, d => tr(...))`. The `danger` class for selection is handled reactively inside the per-row map function by reading `state.selected`.

**Rationale:** This is the idiomatic pattern. Each row's effect tracks `d.label` (for text content) and `state.selected` (for the danger class). When selection changes, only the previously-selected and newly-selected rows' effects re-run — not all rows.

**Trade-off:** Reading `state.selected` inside every row's map function means every row's effect subscribes to `selected`. When selection changes, all rows' effects re-run (each checks `state.selected === d.id`). This is O(n) for selection, which is suboptimal. However, this is the idiomatic approach — the benchmark rules discourage keeping a selection flag per row (#800) and manual DOM manipulation (#772).

### 5. Vite build with `@hypeup/plugin`

**Choice:** Standard Vite project with `@hypeup/plugin` for the babel transform.

**Rationale:** This is hypeup's standard build setup, used by the TodoMVC app. `build-prod` runs `vite build` producing a `dist/` directory. The benchmark serves files from the framework directory, so `index.html` at the root loads the built bundle.

## Risks / Trade-offs

**[Risk] Selection performance is O(n)** → Every row subscribes to `state.selected`, so changing selection re-runs all row effects. For 1,000 rows this should be fast (each effect just toggles a class check), but for 10,000 rows it may show. Mitigation: this is the idiomatic approach per benchmark rules. If needed, a computed per-row could short-circuit, but that risks note #800.

**[Risk] Workspace dependency linking** → The hypeup packages are in `/sig/hypeup`, not published to npm. The benchmark's `package.json` needs to reference them via `file:` or `link:` paths. Mitigation: use `file:../../hypeup/client` style paths or npm link.

**[Risk] Benchmark HTML structure mismatch** → The benchmark's automated tests look for specific element structure, classes, and IDs. Any deviation causes test failures. Mitigation: copy the exact HTML structure from the vanillajs reference implementation, translated into hypeup DSL calls.

**[Risk] Glyphicon preload missing** → The benchmark requires `<span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>` in the HTML or performance suffers. Mitigation: include it in `index.html`.

## Implementation Notes

### Build Configuration

- **Bun required for build**: Hypeup packages export `.ts` source with extensionless imports. Node's ESM loader (used by Vite to load config) can't resolve these. The `build-prod` script uses `/home/dan/.bun/bin/bunx --bun vite build`. For an upstream PR, hypeup packages would need built JS output.
- **Vite entry point**: Configured as `rollupOptions.input: "src/main.ts"` with `entryFileNames: "main.js"` and `outDir: "dist"`. The root `index.html` references `dist/main.js` directly (not built by Vite — Vite only builds the JS).
- **Dependencies**: npm `file:` symlinks to `/sig/hypeup/*` packages. npm v7+ creates symlinks (not copies), so the packages' own `node_modules` (with bun workspace links) remain intact.

### DSL Usage — Workarounds Required

- **Bracket notation not supported**: `div["col-sm-6 smallpad"](...)` fails — the babel plugin's `collectChain()` returns `null` for computed properties. Only dot-notation is supported.
- **Dot-chain class bug**: `div.colSm6.smallpad(...)` produces `className("col-sm-6 smallpad")` (single combined string) for some elements, causing `classList.add()` to throw `InvalidCharacterError`. Strangely, `button.btn.btnPrimary.btnBlock(...)` in the same file works correctly (3 separate calls). Root cause not identified — suspected babel plugin bug in `hypeupBabelPlugin.ts`.
- **Workaround**: All classes use explicit `className()` calls: `div(className("col-sm-6"), className("smallpad"), ...)`. Verbose but reliable.

### Reactivity — `each()` and Array Mutations

- **Array reassignment tears down `each()` reconciler**: When `state.data = newArray`, the thunk wrapping `each()` re-runs, destroying the old reconciler and creating a new one from scratch. The keyed reconciler never gets to diff — it always starts empty. This causes the isKeyed swap test to fail ("1000 new nodes").
- **In-place mutations preserve the reconciler**: When the same proxy-wrapped array is mutated (index assignment, `push`, `splice`), the reconciler's inner effect re-runs and properly diffs keys, reusing/moving DOM nodes.
- **Store pattern**: Operations that replace all data (`run`, `runLots`, `clear`) use reassignment. Operations that modify existing data (`swapRows`, `update`, `add`, `remove`) use in-place mutations.
- **Batching required for multi-step mutations**: `swapRows()` does two index assignments. Without batching, the reconciler fires after the first assignment, seeing duplicate keys (intermediate state). `batch()` from `@hypeup/client` defers effect execution until both assignments complete. Same for `update()` which modifies every 10th index.

### Discovered Issues (potential follow-up changes)

1. **Babel plugin: dot-chain class combination bug** — `hypeup/babel/src/hypeupBabelPlugin.ts` `collectChain()` + class segment mapping sometimes produces a single combined `className()` call instead of separate calls per segment. Needs investigation and a test case.
2. **`each()` + thunk teardown** — The interaction between thunk-wrapped `each()` and array reassignment is a footgun. Users must know to use mutations for efficient updates. Consider making `each()` accept a getter function `() => state.data` so the reconciler persists across data changes, or special-casing `each` in the `be()` function to reuse the reconciler across thunk re-runs.
