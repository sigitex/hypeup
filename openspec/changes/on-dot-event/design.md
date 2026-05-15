## Context

The `on` function in `packages/client/src/on.ts` creates `EventBinding` nodes with auto-redraw. It accepts a string event name and a handler. The `on.silent` namespace variant skips auto-redraw. The lexicon type definition already provides typed overloads using `GlobalEventHandlersEventMap`, but the runtime accepts plain strings with no dot-access shorthand.

The babel plugin (`packages/babel/src/hypeupBabelPlugin.ts`) already transforms DSL primitives at compile time — HTML elements, CSS properties with keyword access (`zIndex.auto`), class chains (`div.active(...)`), at-rules, and builtins like `rule.active(...)` and `doctype.html5`. The `on` identifier is already registered as a builtin that imports from `@hypeup/client`.

## Goals / Non-Goals

**Goals:**
- Enable `on.click(handler)`, `on.keydown(handler)`, etc. as shorthand for `on("click", handler)`.
- Enable `on.silent.click(handler)` as shorthand for `on.silent("click", handler)`.
- Provide full type inference so `on.click(e => ...)` infers `e` as `MouseEvent`.
- Zero runtime cost — the shorthand compiles away entirely.
- Consistent with existing DSL transformation patterns.

**Non-Goals:**
- Removing or deprecating the string-based API.
- Any runtime changes to `packages/client/src/on.ts`.

## Decisions

### Use the babel plugin to transform dot-access into string calls

**Decision**: Add a branch in `handleBuiltin` (when `name === "on"`) that intercepts member expression access. `on.click(handler)` compiles to `on("click", handler)`. `on.silent.click(handler)` compiles to `on.silent("click", handler)`.

**Rationale**: The babel plugin already performs this exact pattern for other DSL primitives. CSS keyword access (`zIndex.auto` → `prop("z-index", "auto")`), rule class access (`rule.active(...)` → `rule(".active", [...])`), and doctype (`doctype.html5` → `raw(...)`) all use the same member-expression-on-known-identifier approach. The infrastructure (`collectChain`, `handleBuiltin`, member expression detection) already exists. This adds zero runtime cost, which is consistent with the framework's design philosophy.

**Alternatives considered**:
- *Runtime Proxy*: Wraps `on` in a Proxy whose `get` trap returns event binders. Works but adds unnecessary runtime overhead on every event binding creation. Also inconsistent — no other DSL primitive uses a Proxy; they all compile away.
- *Code-generated static methods*: Would work but adds bundle size and requires regeneration for every new DOM event.

### Handle `silent` as a known intermediate in the chain

**Decision**: When the babel plugin sees `on.silent.<event>(handler)`, it recognizes `silent` as a known namespace (not an event name) and compiles to `on.silent("<event>", handler)`. The existing `on.silent(event, handler)` call form continues to work unchanged.

**Rationale**: `on.silent` already exists as a namespace function export. The plugin just needs to distinguish the `silent` segment from event name segments, similar to how it distinguishes special properties in other contexts.

### Type definitions use an augmentable `OnEventMap` interface

**Decision**: Export an `OnEventMap` interface from the lexicon that extends `GlobalEventHandlersEventMap`. The mapped types for `on` and `on.silent` reference `OnEventMap` rather than `GlobalEventHandlersEventMap` directly. This allows users to add custom event types via module augmentation:

```typescript
declare module "@hypeup/lexicon" {
  interface OnEventMap {
    "app:themeChanged": CustomEvent<{ theme: "light" | "dark" }>
  }
}
```

The `on` type becomes an intersection of the existing callable signatures and `{ [K in keyof OnEventMap]: (handler: (e: OnEventMap[K]) => void) => EventBinding }`. Same pattern for `on.silent`.

**Rationale**: This gives full autocomplete and type inference for all DOM events out of the box, while allowing users to extend the type system with custom events. The augmentable interface is a well-established TypeScript pattern (used by Vue, Express, etc.). It's purely a type-level concern — the babel transform and runtime already accept any string, so this just closes the type safety gap for custom events.

**Note on casing**: Event names with hyphens or colons (e.g. `htmx:afterSwap`) cannot use dot-access syntax. Users register them in `OnEventMap` for type safety on the string API (`on("htmx:afterSwap", handler)`) but must use the string form at the call site.

## Risks / Trade-offs

- **[Only works with babel plugin]** → Users must use the hypeup babel plugin for dot-access syntax. Mitigated: the entire DSL already requires the babel plugin; there is no plain-JS mode. This is a design constraint of the framework.
- **[Name collision with `silent`]** → If a DOM event named `silent` were ever added, `on.silent` would remain the no-redraw namespace, not an event shorthand. Mitigated: no such event exists or is proposed; `on("silent", handler)` string API remains available.
- **[Non-standard event names]** → `on.customevent(handler)` will compile to `on("customevent", handler)` which works at runtime. Users can add type inference for custom events by augmenting the `OnEventMap` interface. Event names with special characters (hyphens, colons) must still use the string API.
