## Context

The `on` function in `packages/client/src/on.ts` creates `EventBinding` nodes with auto-redraw. It accepts a string event name and a handler. The `on.silent` namespace variant skips auto-redraw. The lexicon type definition already provides typed overloads using `GlobalEventHandlersEventMap`, but the runtime accepts plain strings with no dot-access shorthand.

## Goals / Non-Goals

**Goals:**
- Enable `on.click(handler)`, `on.keydown(handler)`, etc. as shorthand for `on("click", handler)`.
- Enable `on.silent.click(handler)` as shorthand for `on.silent("click", handler)`.
- Provide full type inference so `on.click(e => ...)` infers `e` as `MouseEvent`.
- Zero runtime cost when using the string-based API.

**Non-Goals:**
- Custom/non-DOM event shorthand (users use `on("custom", handler)` for those).
- Removing or deprecating the string-based API.
- Compile-time transformation (this is purely a runtime Proxy).

## Decisions

### Use a Proxy on the `on` function for dot-access

**Decision**: Wrap the `on` function in a `Proxy` with a `get` trap that returns `(handler) => on(prop, handler)` for any property access that isn't `silent`.

**Rationale**: A Proxy is the only mechanism that can intercept arbitrary property access on a function without pre-defining every event name. Defining 80+ static methods would be unmaintainable and bloat the bundle.

**Alternatives considered**:
- *Code-generated static methods*: Would work but adds build complexity and bundle size. Every new DOM event requires regeneration.
- *Babel/build plugin*: Transforms `on.click(h)` to `on("click", h)` at compile time. Zero runtime cost but adds toolchain dependency and doesn't work in plain JS usage.

### Wrap `on.silent` in the same pattern

**Decision**: The `silent` property on the proxy returns another Proxy that maps `on.silent.click(handler)` to `on.silent("click", handler)`.

**Rationale**: Consistent API surface. The `silent` property is a known key handled before the event-name fallback.

### Type definitions use mapped types over `GlobalEventHandlersEventMap`

**Decision**: In the lexicon type definition, define `on` as an intersection of the callable signature and a mapped type `{ [K in keyof GlobalEventHandlersEventMap]: (handler: (e: GlobalEventHandlersEventMap[K]) => void) => EventBinding }`. Same pattern for `on.silent`.

**Rationale**: This gives full autocomplete and type inference without manually listing events. It's the same map the existing generic overload uses, just exposed as properties.

## Risks / Trade-offs

- **[Proxy performance]** → Property access through a Proxy is slightly slower than direct function calls. Mitigated: event binding creation is not a hot path; it happens during vdom construction, not on every frame.
- **[Name collisions with `silent`]** → If a DOM event named `silent` were added to the spec, `on.silent` would remain the no-redraw variant, not an event shorthand. Mitigated: no such event exists or is proposed; the `on("silent", handler)` string API remains available as an escape hatch.
- **[Bundle size]** → Proxy wrapper adds ~10-15 lines of runtime code. Negligible.
