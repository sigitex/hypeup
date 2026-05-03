## Why

The `on()` function currently has the signature `on(event: string, handler: Function): EventBinding`. This means event handlers require manual type annotations:

```ts
on("keydown", (e: KeyboardEvent) => ...)
on("blur", (e: FocusEvent) => ...)
```

This is noise — `"keydown"` *is* `KeyboardEvent`, `"blur"` *is* `FocusEvent`. The DOM already encodes this mapping in `GlobalEventHandlersEventMap`. TypeScript can infer the event type from the event name if we use overloads with a generic constraint.

## What Changes

Add a strongly-typed overload to the global `on()` declaration in `lexicon/src/primitives.ts` that maps known event names to their event types via `GlobalEventHandlersEventMap`. Keep a `string` fallback for custom events.

The `@hypeup/client` implementation stays wide (`event: string, handler: Function`) — the narrow typing lives only in the `declare global` block that user code sees. The babel plugin rewrites the call, and TypeScript is satisfied because the narrow call-site type is assignable to the wide implementation type.

## Capabilities

### Modified Capabilities

- `lexicon-primitives`: Replace the current `on(event: string, handler: Function): EventBinding` global declaration with a strongly-typed overload pair

## Impact

- **@hypeup/lexicon**: `primitives.ts` `declare global` block gets the overloaded `on()` signature
- **@hypeup/todomvc**: Remove now-unnecessary `KeyboardEvent` / `FocusEvent` annotations from `on()` handlers (optional cleanup)
- **No runtime changes** — the babel plugin and client implementation are unchanged
- **No generation needed** — `GlobalEventHandlersEventMap` is already available from `lib.dom.d.ts`
