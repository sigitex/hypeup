## ADDED Requirements

### Requirement: on.create fires callback after element mount
`on.create(callback)` SHALL return an `OnCreate` vdom node. When the containing element is mounted via `mountElement`, the callback SHALL be called with the `HTMLElement` after all content args have been processed and applied. The callback SHALL fire exactly once per mount — it SHALL NOT re-fire on redraws.

#### Scenario: on.create fires with the DOM element
- **WHEN** `mount(root, () => elem("div", [on.create((el) => captured = el)]))` is called
- **THEN** `captured` SHALL be the `<div>` HTMLElement
- **AND** the element SHALL have all other content args (classes, attributes, children) already applied

#### Scenario: on.create does not re-fire on redraw
- **WHEN** a mounted component with `on.create(callback)` is redrawn
- **THEN** `callback` SHALL NOT be called again

#### Scenario: on.create with same callback reference on redraw
- **WHEN** a redraw produces an `on.create` at the same slot position with the same callback reference (`===`)
- **THEN** the slot SHALL be kept as-is (no-op)

#### Scenario: on.create with different callback reference on redraw
- **WHEN** a redraw produces an `on.create` at the same slot position with a different callback reference
- **THEN** the stored callback SHALL be replaced but SHALL NOT be fired

### Requirement: on.remove fires callback on element removal
`on.remove(callback)` SHALL return an `OnRemove` vdom node. When the containing element is removed from the DOM (via `undoSlot` or `disposeHandle`), the callback SHALL be called with the `HTMLElement`. The callback SHALL fire before the element is actually detached from the document.

#### Scenario: on.remove fires on dispose
- **WHEN** `mount(root, () => elem("div", [on.remove((el) => captured = el)]))` is called and then `handle.dispose()` is called
- **THEN** `captured` SHALL be the `<div>` HTMLElement

#### Scenario: on.remove fires when conditional child disappears
- **WHEN** a mounted component renders `elem("div", [showChild && elem("span", [on.remove(callback)])])` and a redraw sets `showChild = false`
- **THEN** `callback` SHALL be called with the `<span>` HTMLElement

#### Scenario: on.remove callback update on redraw
- **WHEN** a redraw produces an `on.remove` at the same slot position with a different callback reference
- **THEN** the stored callback SHALL be replaced
- **AND** the new callback SHALL be the one that fires on eventual removal

### Requirement: on.create and on.remove can coexist on the same element
An element SHALL accept both `on.create` and `on.remove` as content args simultaneously. They occupy separate slot positions and operate independently.

#### Scenario: Combined lifecycle hooks
- **WHEN** `elem("div", [on.create(initFn), on.remove(cleanupFn)])` is mounted and later removed
- **THEN** `initFn` SHALL fire once during mount with the element
- **AND** `cleanupFn` SHALL fire once during removal with the element
