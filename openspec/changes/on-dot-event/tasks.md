## 1. Runtime Proxy Implementation

- [ ] 1.1 Create a helper function `proxyEvents(fn)` that wraps a function in a Proxy whose `get` trap returns `(handler) => fn(prop, handler)` for any string property
- [ ] 1.2 Wrap the inner `silent` function with `proxyEvents` so `on.silent.click(h)` works
- [ ] 1.3 Wrap the `on` function with a Proxy that handles `silent` specially (returning the proxied silent) and delegates all other property access to `proxyEvents` behavior
- [ ] 1.4 Export the proxied `on` in place of the original from `packages/client/src/on.ts`

## 2. Type Definitions

- [ ] 2.1 Define a mapped type `EventShorthand` over `GlobalEventHandlersEventMap` that maps each key `K` to `(handler: (e: GlobalEventHandlersEventMap[K]) => void) => EventBinding`
- [ ] 2.2 Update the `on` type in `packages/lexicon/src/primitives.ts` to be an intersection of the existing callable signatures and `EventShorthand`
- [ ] 2.3 Update the `on.silent` type to include the same `EventShorthand` mapped type (without auto-redraw in the description)

## 3. Verification

- [ ] 3.1 Verify the build passes with no type errors (`bun run build` or equivalent)
- [ ] 3.2 Verify `on.click(handler)` produces the same EventBinding as `on("click", handler)` in a manual test or existing test suite
- [ ] 3.3 Verify `on.silent.click(handler)` produces the same EventBinding as `on.silent("click", handler)`
