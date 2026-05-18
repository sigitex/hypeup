## 1. EventBinding — Add autoRedraw Flag

- [ ] 1.1 In `packages/vdom/src/EventBinding.ts`, add `autoRedraw: boolean` field with default `true` in the constructor
- [ ] 1.2 Update `on()` in `packages/client/src/on.ts` to pass raw handler and `autoRedraw: true` to `EventBinding` (remove the try/finally redraw wrapper)
- [ ] 1.3 Update `on.silent()` in `packages/client/src/on.ts` to pass `autoRedraw: false` to `EventBinding`
- [ ] 1.4 Remove the `import { redraw }` from `packages/client/src/on.ts` (no longer needed)

## 2. Redraw Target Registry

- [ ] 2.1 In `packages/client/src/redraw.ts`, replace `currentRedraw` singleton with a `Set<() => void>` registry
- [ ] 2.2 Export `registerRedrawTarget(fn)` and `unregisterRedrawTarget(fn)` replacing `setRedrawTarget`/`clearRedrawTarget`
- [ ] 2.3 Update `redraw()` to iterate a snapshot of the registry (`[...set]`) calling each registered function
- [ ] 2.4 Update all internal imports of `setRedrawTarget`/`clearRedrawTarget` in `packages/client/src/mount.ts` to use the new registry functions

## 3. MountContext and Scoped Auto-Redraw

- [ ] 3.1 Define `MountContext` type (`{ redraw(): void }`) in `packages/client/src/apply.ts` (or a new `context.ts`)
- [ ] 3.2 Add `context: MountContext` parameter to `mountElement` in `packages/client/src/mount.ts`
- [ ] 3.3 Add `context: MountContext` parameter to `processArg`, `applyClassified`, and `diffSlot` internal functions in `mount.ts`
- [ ] 3.4 Add `context: MountContext` parameter to `apply` in `packages/client/src/apply.ts`
- [ ] 3.5 In `apply()` event case, wrap handler with `context.redraw()` try/finally when `classified.autoRedraw` is true; install raw handler when false
- [ ] 3.6 Update event `SlotRecord` type to store `handler` (user's original), `listener` (installed wrapped function), and `autoRedraw` flag
- [ ] 3.7 Update `undoSlot` event case to use the stored `listener` for `removeEventListener`
- [ ] 3.8 Update `diffLeafSlot` event case to compare user `handler` references for identity, and use `listener` for removal
- [ ] 3.9 Thread `context` through `mountEach` and `diffEach` in `packages/client/src/each.ts`
- [ ] 3.10 In `mount()`, create `MountContext` with `doRedraw` and pass to `mountElement`

## 4. Mount — Registry Integration

- [ ] 4.1 In `mount()`, call `registerRedrawTarget(doRedraw)` instead of `setRedrawTarget(doRedraw)`
- [ ] 4.2 In `mount()` `dispose()`, call `unregisterRedrawTarget(doRedraw)` instead of `clearRedrawTarget()`

## 5. Hydration — Core

- [ ] 5.1 Create `packages/client/src/hydrate.ts` with `hydrate(root, componentFn): AppHandle` entry point
- [ ] 5.2 Implement `hydrateElement(existing: HTMLElement, node: Element, context: MountContext): MountHandle` — walk existing DOM and vdom in parallel, build `SlotRecord[]`
- [ ] 5.3 In `hydrateElement`, handle leaf classified types: verify attributes, classes, styles against existing DOM; record SlotRecords
- [ ] 5.4 In `hydrateElement`, handle event bindings: attach listeners to existing DOM using scoped redraw wrapping
- [ ] 5.5 In `hydrateElement`, handle refs: assign `ref.current` to existing element
- [ ] 5.6 In `hydrateElement`, handle child elements: match by tag name using child cursor, recurse
- [ ] 5.7 In `hydrateElement`, handle text nodes: match positionally, capture into text SlotRecord
- [ ] 5.8 In `hydrateElement`, handle `raw()` nodes: capture existing child nodes at position into raw SlotRecord
- [ ] 5.9 In `hydrateElement`, handle `Each` nodes: iterate items, hydrate each child by position, build `EachState`
- [ ] 5.10 In `hydrateElement`, handle `Lazy` nodes: call `fn(...args)`, hydrate result against existing child, store in lazy SlotRecord
- [ ] 5.11 Implement mismatch fallback: when tag or structure mismatch is detected, remove mismatched subtree and mount fresh via `mountElement`
- [ ] 5.12 In `hydrate()`, register with redraw target registry and return `AppHandle` with `redraw()` and `dispose()`

## 6. Island Hydration

- [ ] 6.1 Add `hydrateIsland(root, componentFn): AppHandle` in `packages/client/src/hydrate.ts` as alias for `hydrate()`
- [ ] 6.2 Add `hydrateIslands(selector, registry): AppHandle[]` — query `document.querySelectorAll(selector)`, read `data-island` attribute, look up in registry, hydrate each match, skip unknown names
- [ ] 6.3 Export `hydrate`, `hydrateIsland`, and `hydrateIslands` from `packages/client/src/index.ts`

## 7. Tests — Redraw Registry

- [ ] 7.1 Add test: single mount registers and global `redraw()` invokes it
- [ ] 7.2 Add test: two mounts coexist, global `redraw()` invokes both
- [ ] 7.3 Add test: dispose unregisters, global `redraw()` no longer invokes disposed root
- [ ] 7.4 Add test: auto-redraw from `on()` event only redraws owning root (scoped)
- [ ] 7.5 Add test: `on.silent()` event does not trigger any redraw

## 8. Tests — Hydration

- [ ] 8.1 Add test: `hydrate()` adopts existing DOM without replacing it
- [ ] 8.2 Add test: `hydrate()` attaches event listeners to existing elements
- [ ] 8.3 Add test: `hydrate()` assigns refs to existing elements
- [ ] 8.4 Add test: redraw after hydration patches DOM via standard diff path
- [ ] 8.5 Add test: dispose after hydration removes DOM and cleans up
- [ ] 8.6 Add test: tag mismatch during hydration falls back to mount
- [ ] 8.7 Add test: `Each` node hydrated from server-rendered list
- [ ] 8.8 Add test: `Lazy` node hydrated from server-rendered content

## 9. Tests — Islands

- [ ] 9.1 Add test: `hydrateIsland()` hydrates a single island root
- [ ] 9.2 Add test: multiple islands hydrated independently with scoped redraw
- [ ] 9.3 Add test: `hydrateIslands()` discovers and hydrates by data-island attribute
- [ ] 9.4 Add test: `hydrateIslands()` skips unknown island names
- [ ] 9.5 Add test: `hydrateIslands()` returns empty array when no matches

## 10. Existing Test Updates

- [ ] 10.1 Update existing mount tests to account for `MountContext` parameter threading (if any internal functions are tested directly)
- [ ] 10.2 Update existing event tests to verify `EventBinding.autoRedraw` flag behavior
- [ ] 10.3 Verify all existing client tests pass with the redraw registry change
