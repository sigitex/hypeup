## Why

`@hypeup/client` currently requires wrapping every reactive expression in `computed(() => ...)` inside component templates. This makes component code noisy, verbose, and unlike every modern framework. A TodoMVC component that should be 15 clean lines becomes 40 lines of `computed()` wrappers. The DX gap between hypeup's server-side ergonomics (clean, composable) and its client-side reactivity (manual, ceremony-heavy) undermines the framework's core value proposition.

The root cause is architectural: signals are opaque boxes that must be explicitly unwrapped, and the mount system only tracks reactivity via `isSignal()` checks. There is no mechanism for reactive expressions (conditionals, derivations, string formatting) to be tracked automatically.

## What Changes

Replace the explicit signal/computed reactivity model with a transparent reactivity system built on two complementary mechanisms:

1. **Proxy-based reactive state** — `reactive()` creates deeply proxied state objects where property access is automatically tracked inside effect contexts. No `.value`, no `.get()`, no `signal()`. State mutation is plain assignment.

2. **Compiler-inserted thunks** — the babel plugin wraps element arguments in `() => expr` arrow functions. The mount system evaluates each thunk inside a fine-grained `effect()`. Proxy property reads inside the thunk are automatically tracked. When tracked state changes, only the specific effect (and its DOM slot) re-evaluates.

Together, these make reactivity invisible to the user. Component code looks like plain JavaScript expressions — the framework handles tracking and updates behind the scenes.

### Before (current)

```ts
function FooterSection() {
  const countText = computed(() =>
    activeCount.value === 1 ? " item left" : " items left"
  )
  const countValue = computed(() => String(activeCount.value))
  const allSelected = computed(() =>
    filter.value === "all" ? new CssClass("selected") : false
  )

  return footer.footer(
    span.todoCount(strong(countValue), countText),
    ul.filters(
      li(a(allSelected, { href: "#/" }, "All")),
    ),
  )
}
```

### After (proposed)

```ts
function FooterSection() {
  return footer.footer(
    span.todoCount(strong(String(activeCount)), activeCount === 1 ? " item left" : " items left"),
    ul.filters(
      li(a(state.filter === "all" && new CssClass("selected"), { href: "#/" }, "All")),
    ),
  )
}
```

## Capabilities

### New Capabilities

- `reactive-state`: Proxy-based reactive state primitive — `reactive()` creates deeply tracked state objects with plain property access and assignment
- `effect-system`: Fine-grained effect primitive that auto-tracks proxy reads and re-runs on changes — replaces explicit `isSignal()` subscription
- `compiler-thunks`: Babel plugin wraps element arguments in thunks for deferred evaluation inside effects — makes reactivity transparent at the template level

### Modified Capabilities

- `client-mount`: Mount system evaluates thunks inside `effect()` instead of checking `isSignal()` — existing signal passthrough preserved as fallback
- `babel-transform`: Element argument expressions wrapped in `() => expr` by the compiler — static literals (strings, numbers, booleans) can be left unwrapped as an optimization
- `client-signals`: `signal()` and `computed()` remain available but are no longer required in templates — `computed()` is still useful for defining derived state outside of templates

## Impact

- **@hypeup/client**: New `reactive()` and `effect()` exports. Mount system rewritten to use effect-based tracking. `signal`/`computed`/`isSignal` kept for backward compatibility.
- **@hypeup/babel**: Plugin updated to wrap element arguments in thunks. Static literal detection to avoid unnecessary wrapping.
- **@hypeup/todomvc**: Rewritten to use `reactive()` state and clean template expressions — serves as validation that the new system works end-to-end.
- **@hypeup/vdom**: No changes expected.
- **@hypeup/runtime** (server): No changes — server-side rendering has no reactivity, classification is unchanged.
- **Dependencies**: May replace `@preact/signals-core` with a custom reactive primitive, or keep it as an internal implementation detail behind the proxy layer.
