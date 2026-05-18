## Why

Hypeup has a server renderer (`@hypeup/render`) that produces HTML from vdom trees and a client runtime (`@hypeup/client`) that mounts interactive apps via `mount()`. These two paths share the same vdom types but cannot work together on the same page: the client always creates fresh DOM rather than adopting server-rendered markup. There is no hydration path, no way to ship a client entry alongside generated pages, and `redraw()` is a module-level singleton that breaks when multiple roots exist. This blocks isomorphic sites (server-render HTML, hydrate on the client for interactivity) and island architectures (hydrate only selected interactive widgets within a static page).

## What Changes

- Add a `hydrate(root, componentFn)` entry point to `@hypeup/client` that walks existing server-rendered DOM, attaches event listeners and refs, and builds `MountHandle` state for subsequent `redraw()` diffs.
- Replace the single-target `currentRedraw` in `redraw.ts` with a registry of redraw targets so multiple mounted/hydrated roots coexist.
- Make auto-redraw (the `on()` event wrapper) island-scoped: `EventBinding` carries an `autoRedraw` flag, and the mount/hydrate layer wraps with the owning root's redraw function instead of the global singleton.
- Keep ambient `redraw()` as "redraw all registered roots" for simple use and backward compatibility.
- Add a `hydrateIsland(root, componentFn)` convenience that hydrates a single island element, enabling selective hydration within a mostly-static page.

## Capabilities

### New Capabilities
- `client-hydrate`: Hydration entry point that adopts existing server-rendered DOM, builds client mount state over it, and enables subsequent redraw-based updates.
- `island-hydration`: Island architecture support — selective hydration of marked interactive regions within a server-rendered page.

### Modified Capabilities
- `redraw-system`: `redraw()` changes from a single-target global to a registry of redraw targets. Auto-redraw after `on()` events becomes root-scoped rather than global.
- `client-events`: `on()` no longer wraps handlers with `redraw()` at construction time. `EventBinding` gains an `autoRedraw` flag. The mount/hydrate layer wraps handlers with the owning root's scoped redraw function.
- `client-mount`: `mount()` registers/unregisters with the redraw target registry instead of `setRedrawTarget`/`clearRedrawTarget`. A `MountContext` is threaded through `mountElement` and `applyClassified` so event listeners close over the correct root's redraw.

## Impact

- `@hypeup/client`: New `hydrate` and `hydrateIsland` exports. `redraw.ts` rewritten (registry instead of singleton). `on.ts` simplified (no longer wraps handlers). `mount.ts` and `apply.ts` gain `MountContext` parameter threading. `SlotRecord` for events gains `autoRedraw` flag and stores the installed listener separately from the user handler.
- `@hypeup/vdom`: `EventBinding` gains an `autoRedraw: boolean` field.
- `@hypeup/render`: No changes needed (already produces the HTML that hydration will adopt).
- `@hypeup/plugin` / babel: No changes needed (existing transforms produce the same vdom; `redraw()` rewrite continues to target `@hypeup/client`).
- **API**: `redraw()` semantics change from "redraw the one mounted app" to "redraw all mounted/hydrated roots." `on()` auto-redraw becomes scoped. Both changes are backward-compatible for single-root apps.
