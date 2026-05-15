## Why

Currently, event bindings require `on("click", handler)` with the event name as a string. This provides no autocomplete or type safety for event names. A `on.click(handler)` shorthand would improve DX by enabling IDE autocomplete for all DOM events and providing strongly-typed event objects without manual generic annotation.

## What Changes

- Extend the babel plugin to transform `on.click(handler)` into `on("click", handler)` at compile time, following the same pattern used for CSS keyword access (`zIndex.auto`) and HTML class chains (`div.active(...)`).
- Add corresponding `on.silent.click(handler)` → `on.silent("click", handler)` transform.
- Export an augmentable `OnEventMap` interface from the lexicon that extends `GlobalEventHandlersEventMap`. The mapped types for `on` and `on.silent` reference this interface, allowing users to add custom events via module augmentation.
- The existing `on(event, handler)` and `on.silent(event, handler)` APIs remain unchanged.
- No runtime changes to `packages/client/src/on.ts`.

## Capabilities

### New Capabilities
- `on-dot-event`: Compile-time dot-access shorthand for event bindings (`on.click`, `on.keydown`, etc.) with full type inference from `GlobalEventHandlersEventMap`. Augmentable `OnEventMap` interface for custom event types.

### Modified Capabilities
- `client-events`: The `on` type gains dot-access event properties and `on.silent` gains the same. Type signatures are extended. No runtime changes.

## Impact

- `packages/babel/src/hypeupBabelPlugin.ts`: Add a branch in `handleBuiltin` for `on` that transforms `on.<event>(handler)` → `on("event", handler)` and `on.silent.<event>(handler)` → `on.silent("event", handler)`.
- `packages/lexicon/src/primitives.ts`: Export an `OnEventMap` interface extending `GlobalEventHandlersEventMap`. Define mapped types for `on` and `on.silent` over `OnEventMap`.
- `packages/babel/tests/plugin.test.ts`: Add test cases for `on.click(handler)` and `on.silent.click(handler)` transforms.
- No breaking changes. All existing `on("event", handler)` calls continue to work.
- No runtime cost — the dot-access syntax compiles away entirely.
