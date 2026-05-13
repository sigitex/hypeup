## Why

The babel plugin imports `each` and `lazy` from `@hypeup/client`, forcing SSG/SSR-only sites to depend on the client package even though they never use client-side DOM code. Both functions are trivial vdom constructors — `each()` creates `new Each(...)` and `lazy()` creates `new Lazy(...)`. They belong in `@hypeup/runtime` alongside the other vdom constructors (`elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `atRule`, `className`).

## What Changes

- **Move `each()` constructor function** from `@hypeup/client/src/each.ts` to `@hypeup/runtime/src/helpers.ts`. Only the constructor overloads move — `mountEach` and `diffEach` stay in `@hypeup/client`.
- **Move `lazy()` function** from `@hypeup/client/src/lazy.ts` to `@hypeup/runtime/src/helpers.ts`.
- **Export both from `@hypeup/runtime`** via `index.ts`.
- **Re-export both from `@hypeup/client`** for backward compatibility — existing client code that imports them directly continues to work.
- **Update the babel plugin** (`buildTable.ts`): change `each` and `lazy` from `module: "@hypeup/client"` to `module: undefined` (defaulting to `@hypeup/runtime`).
- **`on`, `redraw`, `ref`** stay in `@hypeup/client` — they are genuinely client-only (DOM events, DOM patching, DOM refs).

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `runtime-helpers`: Add `each` and `lazy` as runtime helpers.
- `primitive-table`: Change the module source for `each` and `lazy` from `@hypeup/client` to `@hypeup/runtime`.

## Impact

- **`@hypeup/runtime`**: `helpers.ts` gains `each()` and `lazy()`. `index.ts` exports them. Also exports `Each` and `Lazy` from `@hypeup/vdom`.
- **`@hypeup/client`**: `index.ts` re-exports `each` and `lazy` from `@hypeup/runtime`. `each.ts` retains `mountEach` and `diffEach` but imports the `each` constructor from runtime. `lazy.ts` can be removed (re-export only).
- **`@hypeup/babel`**: `buildTable.ts` — `each` and `lazy` move from `clientHelpers` to `escapeHatches` (runtime module).
- **No breaking changes.** All existing imports continue to work via re-exports.
