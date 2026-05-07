## Why

hypeup has no way for users to run code when a DOM element is created or removed. This blocks integration with third-party libraries (e.g., noUiSlider, FullCalendar, CodeMirror) that need to initialize on a real DOM element and clean up on removal. The existing `ref()` gives access to the element but provides no timing guarantees or removal hook.

## What Changes

- Add `on.create(callback)` — a content arg that fires `callback(element)` after the element is fully mounted into the DOM. Covers: third-party lib init, focus management, measurements, canvas setup.
- Add `on.remove(callback)` — a content arg that fires `callback(element)` when the element is being removed from the DOM. Covers: third-party lib teardown, timer/subscription cleanup.
- Both callbacks receive the `HTMLElement` as their argument.
- New vdom node types `OnCreate` and `OnRemove` in `@hypeup/vdom`.
- New classified kinds and slot record types in `@hypeup/client`.
- `on.create` and `on.remove` are namespace extensions on the existing `on` function, following the same pattern as `on.silent`.

## Capabilities

### New Capabilities
- `client-lifecycle`: Lifecycle hook support (`on.create` and `on.remove`) for running user code at element mount and removal time.

### Modified Capabilities
- `vdom-nodes`: Adding `OnCreate` and `OnRemove` node types to the vdom package exports.
- `client-mount`: `mountElement` must fire `oncreate` callbacks after element assembly; `undoSlot`/`disposeHandle` must fire `onremove` callbacks during teardown.
- `client-events`: `on` namespace gains `create` and `remove` methods alongside existing `silent`.

## Impact

- **Packages**: `@hypeup/vdom` (new exports), `@hypeup/client` (classify, apply, mount, on)
- **APIs**: Additive only — two new functions on the `on` namespace. No breaking changes.
- **Dependencies**: None — pure additions to existing packages.
