## Context

The babel plugin's `buildTable.ts` categorizes DSL globals into two groups:
- **Runtime escape hatches** (`elem`, `elemVoid`, `prop`, `attr`, `raw`, `rule`, `className`, `cssString`, `doctype`) — imported from `@hypeup/runtime`
- **Client helpers** (`on`, `redraw`, `ref`, `each`, `lazy`) — imported from `@hypeup/client`

`each()` and `lazy()` are in the client group, but they're pure vdom constructors — `each()` calls `new Each(items, keyFn, mapFn)` and `lazy()` calls `new Lazy(fn, args)`. Neither touches the DOM. The client package has additional DOM-specific code (`mountEach`, `diffEach`, `mountElement`, etc.) that uses these vdom nodes, but the constructors themselves are runtime-level.

## Goals / Non-Goals

**Goals:**
- `each()` and `lazy()` constructor functions live in `@hypeup/runtime`.
- The babel plugin imports them from `@hypeup/runtime` instead of `@hypeup/client`.
- SSG/SSR sites no longer need `@hypeup/client` as a dependency.
- `@hypeup/client` re-exports both for backward compatibility.

**Non-Goals:**
- Moving `on`, `redraw`, or `ref` — these are genuinely client-only.
- Moving `mountEach`, `diffEach`, or any DOM-related code — stays in client.
- Changing the function signatures or behavior of `each` or `lazy`.

## Decisions

### 1. Add `each()` and `lazy()` to `@hypeup/runtime/src/helpers.ts`

Copy the constructor functions (not the mount/diff code) into `helpers.ts`. The `each()` function has two overloads (3-arg with keyFn, 2-arg with index keys). The `lazy()` function is a one-liner.

**Rationale:** `helpers.ts` already contains all vdom constructor helpers. These fit the same pattern.

### 2. Update `buildTable.ts` — move `each` and `lazy` to runtime escape hatches

Move `"each"` and `"lazy"` from `clientHelpers` to `escapeHatches`. This changes their `module` from `"@hypeup/client"` to `undefined` (which defaults to `@hypeup/runtime`).

**Rationale:** One-line change per identifier. The plugin's escape hatch handler at line 420-422 just replaces the identifier with an import — works identically regardless of source module.

### 3. Re-export from `@hypeup/client` for backward compatibility

`@hypeup/client/src/index.ts` re-exports `each` and `lazy` from `@hypeup/runtime`. The client's `each.ts` imports `each` from runtime instead of defining it locally, keeping `mountEach` and `diffEach` alongside it.

**Rationale:** No breaking changes for existing client-side code.

### 4. Export `Each` and `Lazy` vdom types from `@hypeup/runtime`

Add `Each` and `Lazy` to the re-export list from `@hypeup/vdom` in runtime's `index.ts`.

**Rationale:** Runtime already re-exports all other vdom types. These were missing because their constructors lived in client.

## Risks / Trade-offs

- **[Risk] Circular dependency** -> Not possible. Runtime depends on vdom, client depends on runtime and vdom. Moving constructors to runtime doesn't create new dependency edges.
- **[Trade-off] Slight duplication in client's each.ts** -> The client still needs its own `each.ts` for `mountEach`/`diffEach`, but imports the `each` constructor from runtime. This is clean and avoids duplicating the constructor logic.
