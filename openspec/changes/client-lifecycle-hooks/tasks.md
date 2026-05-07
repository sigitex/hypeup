## 1. Vdom Node Types

- [ ] 1.1 Create `packages/vdom/src/OnCreate.ts` with `OnCreate` class (single `callback` field)
- [ ] 1.2 Create `packages/vdom/src/OnRemove.ts` with `OnRemove` class (single `callback` field)
- [ ] 1.3 Export `OnCreate` and `OnRemove` from `packages/vdom/src/index.ts`

## 2. Client Classification

- [ ] 2.1 Import `OnCreate` and `OnRemove` in `packages/client/src/classify.ts`
- [ ] 2.2 Add `oncreate` and `onremove` variants to the `Classified` type
- [ ] 2.3 Add `instanceof OnCreate` and `instanceof OnRemove` branches in `classify()`

## 3. Client Apply/Undo

- [ ] 3.1 Add `oncreate` and `onremove` variants to `SlotRecord` type in `packages/client/src/apply.ts`
- [ ] 3.2 Handle `oncreate` and `onremove` in `apply()` — return slot records without side effects
- [ ] 3.3 Handle `onremove` in `undoSlot()` — call `slot.callback(element)`
- [ ] 3.4 Handle `oncreate` in `undoSlot()` — no-op

## 4. Client Mount/Diff

- [ ] 4.1 Handle `oncreate` and `onremove` classified kinds in `applyClassified()` in `packages/client/src/mount.ts`
- [ ] 4.2 Fire `oncreate` callbacks at end of `mountElement()` after all slots are processed
- [ ] 4.3 Handle `oncreate` diff in `diffSlot()` — same ref keeps slot, different ref replaces without firing
- [ ] 4.4 Handle `onremove` diff in `diffSlot()` — same ref keeps slot, different ref replaces stored callback

## 5. on Namespace Extension

- [ ] 5.1 Import `OnCreate` and `OnRemove` in `packages/client/src/on.ts`
- [ ] 5.2 Add `on.create(callback)` returning `OnCreate` to the `on` namespace
- [ ] 5.3 Add `on.remove(callback)` returning `OnRemove` to the `on` namespace

## 6. Tests

- [ ] 6.1 Test: `on.create` fires with DOM element after mount
- [ ] 6.2 Test: `on.create` does not re-fire on redraw
- [ ] 6.3 Test: `on.remove` fires on `handle.dispose()`
- [ ] 6.4 Test: `on.remove` fires when conditional child disappears on redraw
- [ ] 6.5 Test: `on.create` and `on.remove` coexist on the same element
- [ ] 6.6 Test: `on.remove` callback is updated when reference changes on redraw
