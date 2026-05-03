## Why

Currently, event bindings require `on("click", handler)` with the event name as a string. This provides no autocomplete or type safety for event names. A `on.click(handler)` shorthand via a Proxy would improve DX by enabling IDE autocomplete for all DOM events and providing strongly-typed event objects without manual generic annotation.

## What Changes

- Add a Proxy-based wrapper around `on` so that `on.click(handler)` is equivalent to `on("click", handler)`, for all events in `GlobalEventHandlersEventMap`.
- Add corresponding `on.silent.click(handler)` shorthand for silent event bindings.
- Update the lexicon type definition for `on` to expose dot-access properties for every key in `GlobalEventHandlersEventMap`.
- The existing `on(event, handler)` and `on.silent(event, handler)` APIs remain unchanged.

## Capabilities

### New Capabilities
- `on-dot-event`: Proxy-based dot-access shorthand for event bindings (`on.click`, `on.keydown`, etc.) with full type inference from `GlobalEventHandlersEventMap`.

### Modified Capabilities
- `client-events`: The `on` export gains dot-access event properties and `on.silent` gains the same. Type signatures are extended.

## Impact

- `packages/client/src/on.ts`: Wrap `on` function and `on.silent` in Proxies that intercept property access.
- `packages/lexicon/src/primitives.ts`: Extend the `on` type definition with mapped types over `GlobalEventHandlersEventMap`.
- No breaking changes. All existing `on("event", handler)` calls continue to work.
