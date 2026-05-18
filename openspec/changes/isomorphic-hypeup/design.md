## Context

Hypeup's client runtime (`@hypeup/client`) mounts interactive apps via `mount(root, componentFn)`. The mount system creates fresh DOM from vdom trees, records `SlotRecord[]` state per element, and patches on `redraw()`. The server renderer (`@hypeup/render`) produces HTML strings from the same vdom types but is completely separate — there is no way for the client to adopt server-rendered markup.

The `redraw()` function is a module-level singleton (`currentRedraw` in `redraw.ts`). Only one mounted root can be the redraw target at a time. Event handlers created by `on()` wrap the user's callback with a `try/finally` that calls the global `redraw()` at construction time, before the owning root is known.

The goal is to enable isomorphic sites (server-render then hydrate) and island architectures (hydrate selected interactive regions) without breaking the existing single-root app model.

## Goals / Non-Goals

**Goals:**
- Hydration: walk existing server-rendered DOM to build client mount state, then use the standard redraw/diff path for updates.
- Multi-root support: multiple `mount()` or `hydrate()` calls coexist without interfering.
- Scoped auto-redraw: event handlers created by `on()` trigger only their owning root's redraw, not a global singleton.
- Global `redraw()` stays ambient and redraws all registered roots for backward compatibility.
- Island hydration: selectively hydrate interactive widgets within a mostly-static page.

**Non-Goals:**
- Partial hydration (skipping subtrees that have no interactivity). Full subtree hydration is sufficient for now.
- Streaming SSR or progressive hydration.
- Client-side routing or SPA navigation.
- Serializing reactive state from server to client (users provide their own boot data).
- Changes to `@hypeup/render` — it already produces the correct HTML.
- Changes to the babel plugin or `@hypeup/plugin`.

## Decisions

### 1. Redraw target registry replaces singleton

**Decision:** Replace `currentRedraw` (a single `(() => void) | null`) with a `Set<() => void>` registry. `mount()` and `hydrate()` register their root redraw function; `dispose()` unregisters it. Global `redraw()` iterates a snapshot of the set.

**Rationale:** This is the minimal change that enables multi-root. The existing `setRedrawTarget`/`clearRedrawTarget` API is internal, so the change is non-breaking. Global `redraw()` semantics shift from "redraw the one app" to "redraw all apps," which is correct for the common case and backward-compatible for single-root apps.

**Alternative considered:** Scoped-only redraw (no global). Rejected because it breaks the ambient `redraw()` mental model and requires all async code to hold a handle reference.

### 2. `MountContext` threaded through mount/hydrate/apply

**Decision:** Introduce a `MountContext` type (`{ redraw(): void }`) that is passed from `mount()`/`hydrate()` through `mountElement`, `hydrateElement`, `applyClassified`, and `apply`. Event listeners close over `context.redraw()` instead of the global singleton.

**Rationale:** This makes auto-redraw root-scoped without any global state or transformer magic. The context flows naturally through the existing call tree. The cost is an extra parameter on internal functions, but these are all internal — the public API is unchanged.

**Alternative considered:** Transformer-based scoping (rewrite `redraw()` calls to a context-bound local). Rejected as unnecessary complexity when event auto-redraw is the primary scoping need, and explicit `redraw()` calls are served by the global registry.

### 3. `EventBinding` gains `autoRedraw` flag; wrapping moves to apply time

**Decision:** `on()` no longer wraps handlers with `redraw()`. Instead, `EventBinding` stores the raw handler and an `autoRedraw: boolean` flag (true for `on()`, false for `on.silent()`). The mount/hydrate `apply` layer wraps the handler with the owning root's `context.redraw()` when `autoRedraw` is true.

**Rationale:** This separates the vdom descriptor (what event, what handler, should it redraw?) from the runtime concern (which root's redraw function?). The same `EventBinding` can be used by both mount and hydrate. The `SlotRecord` for events stores the installed listener separately from the user handler so diff/removal works correctly.

**Alternative considered:** Keep wrapping in `on()`, use global registry `redraw()`. This works but means every event handler redraws all roots, which is wasteful for islands. Scoped wrapping at apply time is more precise.

### 4. `hydrateElement` walks existing DOM to build `MountHandle`

**Decision:** `hydrateElement(existing: HTMLElement, node: Element, context: MountContext): MountHandle` walks the server-rendered DOM element and its children, matching them against the vdom tree. For each content arg it classifies the vdom value and either verifies the existing DOM (attributes, classes, styles, text) or attaches client-only state (event listeners, refs). It produces the same `SlotRecord[]` structure as `mountElement`, so subsequent `diffElement` calls work unchanged.

Child elements are matched by tag name using a child cursor. Text nodes are matched positionally. If a mismatch is detected (wrong tag, missing node), hydration falls back to removing the mismatched subtree and mounting fresh — a recovery path, not the happy path.

**Rationale:** Reusing the existing `MountHandle`/`SlotRecord` types means zero changes to the diff system. Hydration is "build the same state mount would have built, but over existing DOM instead of creating new DOM."

**Alternative considered:** A separate hydration state type. Rejected because it would require duplicating all diff logic.

### 5. `hydrate()` entry point mirrors `mount()` signature

**Decision:** `hydrate(root: HTMLElement, componentFn: () => Element): AppHandle` has the same signature and return type as `mount()`. It calls `componentFn()` to get the vdom, then calls `hydrateElement` on `root.firstElementChild` instead of `mountElement`. The returned `AppHandle` has `redraw()` and `dispose()` just like `mount()`.

**Rationale:** Identical API surface means users can swap `mount()` for `hydrate()` with no other code changes. The component function is the same in both cases — it produces vdom, and the runtime decides whether to create or adopt DOM.

### 6. `hydrateIsland` convenience for island architecture

**Decision:** `hydrateIsland(root: HTMLElement, componentFn: () => Element): AppHandle` is a thin wrapper around `hydrate()` that hydrates a single island root. It is functionally identical to `hydrate()` but exists as a semantic alias for documentation clarity.

For discovering islands, a simple `hydrateIslands(selector: string, registry: Record<string, () => Element>)` helper queries `document.querySelectorAll(selector)`, reads a `data-island` attribute to look up the component, and hydrates each match. This is a userland convenience, not a core primitive.

**Rationale:** Islands are just multiple `hydrate()` calls. The multi-root redraw registry already handles the hard part. A discovery helper reduces boilerplate but is not architecturally significant.

**Alternative considered:** A framework-level island discovery system with serialized props. Rejected as premature — users can build this with `data-*` attributes and `JSON.parse()`.

### 7. Text node and `raw()` hydration strategy

**Decision:** During hydration, text content is verified by comparing `textContent` against the expected string. If it matches, the existing `Text` node is reused. For `raw()` nodes, the existing child nodes at that position are captured into the `SlotRecord` without re-parsing — the HTML is assumed to match since both paths use the same vdom.

**Rationale:** Text and raw nodes are the trickiest part of hydration because browsers may normalize whitespace or merge adjacent text nodes. The approach is optimistic: trust the server output matches, capture existing nodes, and let future diffs handle any discrepancies.

## Risks / Trade-offs

- **[DOM mismatch between server and client render]** If the component function produces different vdom on server vs client (e.g., `Date.now()`, browser-only APIs), hydration will encounter mismatches. Mitigation: fall back to mount-from-scratch for mismatched subtrees, log a dev-mode warning. Document that hydrated components must be deterministic.

- **[Global `redraw()` redraws all roots]** A manual `redraw()` call triggers every registered root, which is O(n) in island count. Mitigation: for most sites n is small (< 20). Lazy/factory boundaries prevent deep subtree work for unchanged islands. If profiling shows this is expensive, scoped `app.redraw()` is already available as an optimization.

- **[Text node positional matching is fragile]** Browsers may merge adjacent text nodes or add whitespace. Mitigation: hydration captures whatever nodes exist at the expected position. Mismatches trigger fallback remount of that subtree.

- **[`MountContext` parameter threading adds noise to internal APIs]** Every internal function gains a `context` parameter. Mitigation: these are all private functions — the public API is unchanged. The parameter is small (single object with one method).

- **[`EventBinding.autoRedraw` changes `@hypeup/vdom` public type]** Adding a field to `EventBinding` is a minor semver concern. Mitigation: the field has a default value (true), so existing code constructing `EventBinding` directly continues to work.
