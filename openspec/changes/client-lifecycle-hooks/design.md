## Context

hypeup's client runtime mounts vdom trees into real DOM elements via a classify-apply-diff pipeline. Content args (classes, attributes, events, children, etc.) are classified into typed `Classified` values, applied to DOM elements as `SlotRecord` entries, and diffed/undone on redraw or removal. The `on()` function already provides a namespace pattern (`on.silent`) for event-related helpers. There is currently no mechanism for users to hook into the element creation or removal lifecycle.

## Goals / Non-Goals

**Goals:**
- Let users run code when a DOM element is fully mounted (all args applied, element in the DOM)
- Let users run cleanup code when a DOM element is removed from the DOM
- Follow existing architecture: vdom node type → classify → apply/undo slot pipeline
- Extend the existing `on` namespace rather than adding new top-level exports
- Both callbacks receive the `HTMLElement` so users don't need a separate `ref()` for DOM access

**Non-Goals:**
- `onupdate` hook (can be revisited later; most use cases are covered by the redraw cycle + `ref`)
- Component-level lifecycle (hypeup has no component abstraction — `Lazy` is a memoization boundary, not a component)
- Async lifecycle (e.g., animation-on-exit with delayed removal)

## Decisions

### 1. Vdom representation: dedicated node types

**Decision**: Create `OnCreate` and `OnRemove` classes in `@hypeup/vdom`, each holding a single `callback` field.

**Alternatives considered**:
- *Overloading `Ref`*: Could extend `Ref` with optional callbacks, but conflates two concerns and makes the classify path messier.
- *Plain object convention*: e.g., `{ oncreate: fn }` — hypeup classifies plain objects as attribute bags, so this would require special-casing and is ambiguous.

**Rationale**: Dedicated classes match how every other vdom content type works (`CssClass`, `Attr`, `EventBinding`, etc.) and integrate cleanly with `instanceof`-based classification.

### 2. Namespace syntax: `on.create` / `on.remove`

**Decision**: Add `create` and `remove` as functions on the existing `on` namespace, using TypeScript's `export namespace` pattern already used by `on.silent`.

**Rationale**: Groups all "things that happen" under `on`. No new top-level export needed. Consistent with existing API surface.

### 3. `oncreate` firing point: end of `mountElement`, inline tracking

**Decision**: Track `oncreate` callbacks inline during `mountElement`'s build loop using lazy initialization (`createCallbacks ??= []`). After the loop completes, fire any collected callbacks. This avoids a second scan over the slots array.

**Alternatives considered**:
- *Fire in `applyClassified`*: Would fire before sibling args are processed — element is only partially assembled.
- *Fire after `parent.appendChild`*: Would require threading parent knowledge into `mountElement`, which currently only builds the element without knowing its parent.
- *Post-mount scan*: Process all args into slots, then iterate slots a second time looking for `oncreate` records. Works but pays the cost of a second loop for every element, even those without lifecycle hooks.

**Rationale**: Inline tracking means elements without lifecycle hooks pay only a null check (the lazy-initialized array stays null), not a full scan. The callbacks still fire after all slots are processed, so the element is fully assembled. The element may not yet be in the document (parent appends it after), but it is fully constructed. For most third-party libs, the element just needs to exist and be appendable — and by the time the user's component function returns and `mount()` appends to `root`, the element is in the document. For child elements, `mountElement` is called before `parent.appendChild(childHandle.element)`, so `oncreate` fires just before DOM insertion — acceptable for initialization.

### 4. `onremove` firing point: during `undoSlot`

**Decision**: When `undoSlot` encounters an `"onremove"` slot, call `slot.callback(element)`. This fires during the teardown path — before the element is actually removed from the DOM (the caller removes it after `undoSlot`/`disposeHandle`).

**Rationale**: Matches Mithril's `onremove` semantics. The element is still in the DOM when cleanup runs, so third-party libs can inspect DOM state if needed.

### 5. Diff behavior

**Decision**:
- `oncreate`: On redraw, if the slot position still has an `oncreate` with the same callback reference (`===`), keep the old slot (no-op). If the callback changes, replace the stored reference but do NOT re-fire — create only fires once per mount.
- `onremove`: On redraw, if the callback reference changes, replace the stored reference. The new callback will fire on eventual removal.

**Rationale**: `oncreate` is an initialization hook — re-firing on every redraw would defeat the purpose. `onremove` just stores a reference for later, so swapping it is safe.

## Risks / Trade-offs

- **`oncreate` fires before document insertion for child elements**: The element is fully assembled but may not be in the document yet (parent hasn't appended it). Most third-party libs work fine with a detached element, but any lib that needs `getBoundingClientRect()` or computed styles would get zeros. → *Mitigation*: Document this timing. If needed later, a post-mount queue could defer callbacks to after the full tree is in the document.

- **No async removal**: `onremove` is synchronous — the element is removed immediately after callbacks fire. No support for exit animations that delay removal. → *Mitigation*: Out of scope for this change. Could be added later with a `Promise`-based `onremove` variant.

- **Slot position sensitivity**: Like all hypeup content args, lifecycle hooks occupy a slot position. If the user reorders args between redraws, the diff will see a kind mismatch and undo/re-apply. → *Mitigation*: This is consistent with how all other content args behave. Not a new concern.
