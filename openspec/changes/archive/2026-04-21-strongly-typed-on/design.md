## Context

The `on()` global currently has signature `on(event: string, handler: Function): EventBinding`. This requires manual type annotations on event handlers (e.g., `(e: KeyboardEvent) => ...`). The DOM already maps event names to event types via `GlobalEventHandlersEventMap`.

## Goals / Non-Goals

**Goals:**
- Infer event type from event name at the `on()` call site — no manual annotations needed
- Support all standard DOM events (not just HTMLElement-specific ones)
- Maintain a `string` fallback for custom/non-standard events

**Non-Goals:**
- Per-element event validation (e.g., restricting `"play"` to `<video>`)
- Making `EventBinding` generic (it stays opaque)
- Generating event maps from web specs (TypeScript's `lib.dom.d.ts` is sufficient)
- Changing the babel plugin or runtime behavior

## Decisions

### 1. Use overloads with `GlobalEventHandlersEventMap`

The global declaration uses a generic overload for known events and a `string` fallback:

```ts
declare global {
  function on<K extends keyof GlobalEventHandlersEventMap>(
    event: K,
    handler: (e: GlobalEventHandlersEventMap[K]) => void
  ): EventBinding

  function on(event: string, handler: (e: Event) => void): EventBinding
}
```

`GlobalEventHandlersEventMap` is the broadest standard map — it covers all events that any HTML element can fire (click, keydown, blur, etc.). No generation needed; it's already in `lib.dom.d.ts`.

**Alternative considered**: Single generic with conditional type (`K extends keyof ... ? ... : Event`). Rejected — overloads give better IDE inference and cleaner error messages.

**Alternative considered**: `HTMLElementEventMap`. Rejected — `GlobalEventHandlersEventMap` is broader and covers the same events plus extras.

### 2. Lexicon owns the narrow type, client stays wide

The strongly-typed overloads live only in the `declare global` block in `lexicon/src/primitives.ts`. The `@hypeup/client` implementation keeps its current wide signature (`event: string, handler: Function`).

Post-babel-transform, TypeScript sees `import { on } from "@hypeup/client"` — but the call site was already validated against the global overloads. The wide implementation type is assignable from the narrow call-site type.

### 3. EventBinding stays non-generic

`EventBinding` remains `class EventBinding { constructor(event: string, handler: Function) }`. The type safety lives entirely at the `on()` call site. Once the binding is created, its type is opaque — no downstream code inspects or constrains the handler type.

## Risks / Trade-offs

- **[Minimal risk]** — This is purely a typing change with no runtime impact.
- **[IDE behavior]** — Overloads may cause slightly different autocomplete behavior vs a single generic. In practice, overloads are well-supported and provide better inference for callbacks.
