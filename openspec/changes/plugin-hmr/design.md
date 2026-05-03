## Context

The `@hypeup/plugin` unplugin transforms hypeup DSL calls via Babel but provides no HMR support. Vite falls back to full page reloads on every file save. The framework uses a `mount(root, componentFn)` pattern where the component function is captured in a closure. Standard ESM self-accepting HMR does not work because importers retain stale references to old function exports after hot replacement.

## Goals / Non-Goals

**Goals:**
- File saves during development trigger HMR updates instead of full page reloads
- No changes required in consumer project code — HMR is automatic
- Zero HMR code in production builds
- Component function identity is preserved across hot updates so `mount()`'s closure picks up new implementations via `redraw()`

**Non-Goals:**
- Component-local state preservation across HMR (state resets are acceptable)
- HMR for non-function exports (constants, objects, etc.)
- HMR for files that don't contain hypeup DSL primitives
- Server-side rendering HMR

## Decisions

### 1. Proxy registry in `@hypeup/plugin/hmr-runtime` (not `@hypeup/client`)

The HMR runtime is dev-only infrastructure. Placing it in `@hypeup/plugin` (a devDependency) keeps it out of the client bundle. The plugin injects imports from `@hypeup/plugin/hmr-runtime` only in dev mode, so production builds never reference it.

**Alternative considered:** `globalThis`-based registry with no imports. Rejected because it scatters logic across inline injected strings and makes debugging harder.

**Alternative considered:** Placing in `@hypeup/client`. Rejected because HMR is not a production concern.

### 2. Stable proxy functions that delegate to registry lookups

Each exported function is wrapped in a proxy that does `registry.get(id).apply(this, arguments)`. The proxy is created once on first module evaluation and reused on subsequent HMR updates. This means the proxy reference captured by `mount()` always delegates to the latest function implementation.

**Alternative considered:** Dispose-and-remount pattern in `main.ts`. Simpler but requires user boilerplate and loses the automatic DX.

### 3. Export rewriting via a second Babel plugin in the transform pipeline

After the hypeup DSL transform, a second Babel visitor rewrites `export function Foo()` declarations to:
1. A plain `function Foo()` declaration
2. A `const __hmr_Foo = __hmr_register(moduleId + ":Foo", Foo)` binding
3. An `export { __hmr_Foo as Foo }` specifier

This runs in the same `transformAsync` call (added to the `plugins` array), so there's no second parse pass.

**Alternative considered:** Regex-based string manipulation post-transform. Rejected because finding function body boundaries with regex is fragile.

### 4. Dev mode detection

The plugin checks `process.env.NODE_ENV !== "production"` to decide whether to inject HMR code. The second Babel plugin and HMR snippet are only added to the plugins array and appended to output in dev mode.

### 5. Project file gating

HMR injection only applies to files under the consumer project's `cwd` (already partially implemented). Framework package files (workspace-linked `@hypeup/*` packages) are excluded since they don't have `@hypeup/client` available and shouldn't be HMR boundaries.

## Risks / Trade-offs

- **[Source map accuracy]** The export rewriting changes line positions. Since it's done as a Babel plugin in the same transform pass, source maps should remain accurate. → Mitigated by using Babel AST transforms rather than string concatenation.
- **[Non-function exports ignored]** Exported constants or objects won't trigger HMR updates. → Acceptable for MVP; component functions are the primary use case.
- **[Proxy overhead]** Every component call goes through an extra function indirection. → Negligible cost; only applies in dev mode.
- **[Arrow function exports]** `export const Foo = () => ...` won't be caught by the function declaration visitor. → Can be added later; `export function` is the conventional pattern in hypeup.
