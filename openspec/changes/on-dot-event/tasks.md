## 1. Babel Plugin Transform

- [ ] 1.1 In `handleBuiltin`, add a branch for `name === "on"` that detects when `on` is the root of a member expression chain (using the existing `collectChain` or equivalent parent-path walking)
- [ ] 1.2 Handle single-segment chain: `on.click(handler)` → compile to `on("click", handler)` (import `on` from `@hypeup/client`, emit a call expression with the event name as a string literal)
- [ ] 1.3 Handle two-segment chain with `silent`: `on.silent.click(handler)` → compile to `on.silent("click", handler)` (import `on` from `@hypeup/client`, access `.silent`, emit a call with the event name as string literal)
- [ ] 1.4 Ensure bare `on("click", handler)` and `on.silent("click", handler)` continue to work (existing behavior, just verify no regression)

## 2. Type Definitions

- [ ] 2.1 Export an `OnEventMap` interface from `packages/lexicon/src/primitives.ts` that extends `GlobalEventHandlersEventMap` (empty body — users augment it)
- [ ] 2.2 Define a mapped type `EventShorthand` over `OnEventMap` that maps each key `K` to `(handler: (e: OnEventMap[K]) => void) => EventBinding`
- [ ] 2.3 Update the `on` type in `packages/lexicon/src/primitives.ts` to be an intersection of the existing callable signatures and `EventShorthand`
- [ ] 2.4 Update the `on.silent` type to include the same `EventShorthand` mapped type (without auto-redraw in the description)

## 3. Tests

- [ ] 3.1 Add babel plugin test: `on.click(handler)` transforms to `on("click", handler)` with proper import
- [ ] 3.2 Add babel plugin test: `on.silent.click(handler)` transforms to `on.silent("click", handler)` with proper import
- [ ] 3.3 Add babel plugin test: `on("click", handler)` (string form) continues to work unchanged
- [ ] 3.4 Add babel plugin test: `on.silent("click", handler)` (string form) continues to work unchanged

## 4. Verification

- [ ] 4.1 Verify the build passes with no type errors
- [ ] 4.2 Verify all existing babel plugin tests still pass

## 5. Documentation

- [ ] 5.1 Update the "Events" section in `README.md` to show the dot syntax alternative: `on.click(handler)` alongside `on("click", handler)`
- [ ] 5.2 Document `on.silent.click(handler)` for events that skip auto-redraw
