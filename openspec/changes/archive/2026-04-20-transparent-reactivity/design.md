## Context

`@hypeup/client` uses `@preact/signals-core` for reactivity. The current model requires users to:
- Wrap reactive state in `signal()` and read via `.value`
- Wrap every derived reactive expression in `computed(() => ...)`  
- Pass signals or computeds explicitly as element arguments for the mount system to track them via `isSignal()`

This creates significant ceremony in component code. The TodoMVC implementation exposed the problem clearly — most component code is `computed()` wrappers around simple expressions.

The hypeup DSL's core strength is heterogeneous argument lists where classification happens at runtime. This is fundamentally at odds with frameworks that require static structure (React, Solid's JSX). But it aligns well with a proxy-based reactivity model where any property access inside an effect context is automatically tracked.

The babel plugin already transforms DSL calls (`div(...)` → `elem("div", [...])`) — it can be extended to wrap arguments in thunks for deferred evaluation.

## Goals / Non-Goals

**Goals:**
- Eliminate `computed()` from component template code entirely
- Replace `signal()` / `.value` with plain property access and assignment via `reactive()`
- Make reactivity transparent — component code looks like plain JavaScript
- Fine-grained DOM updates (per-argument, not per-component)
- Maintain the heterogeneous argument model and runtime classification
- Keep `signal()` / `computed()` available for advanced use cases and backward compatibility

**Non-Goals:**
- List reconciliation / keyed diffing (deferred, same as before — full list teardown/rebuild)
- SSR hydration
- Batching / scheduling (optimization for later)
- Stores / nested reactive paths (plain `reactive()` with leaf-level reactivity is sufficient for now)
- Performance optimization of the thunk wrapping (wrap everything first, optimize static detection later)

## Decisions

### 1. Proxy-based `reactive()` with deep tracking

Create a `reactive<T>(obj: T): T` function that returns a deeply proxied version of the input object. The proxy intercepts `get` (to track dependencies in the current effect context) and `set` (to notify subscribers).

```ts
const state = reactive({
  todos: [] as Todo[],
  filter: "all" as Filter,
})

// Read — tracked if inside an effect
state.filter // "all"

// Write — triggers effects that read this property
state.filter = "active"
```

Deep proxying: when a `get` returns an object, wrap it in a proxy too (cached). This makes `state.todos[0].completed` trackable at the leaf level.

**Alternative considered**: Vue 3's `ref()` / `reactive()` split. Rejected — `ref()` reintroduces `.value` which is exactly what we're eliminating. Single `reactive()` for objects, plain `signal()` kept for primitive values if needed.

**Alternative considered**: Using `@preact/signals-core` under the hood with proxy wrappers. Possible but adds complexity — a custom reactive primitive is simpler and avoids the signal/proxy impedance mismatch.

### 2. Custom effect system replacing `@preact/signals-core`

Implement a minimal effect system (~50-100 lines):

- Global `currentEffect` tracking context
- `effect(fn)` — runs `fn`, records which reactive properties were read, re-runs when any change
- `computed(fn)` — cached derived value, re-evaluates when deps change (lazy)
- `batch(fn)` — defers effect execution until the batch completes

The reactive proxy's `get` trap registers `currentEffect` as a subscriber. The `set` trap notifies subscribers.

**Why replace `@preact/signals-core`**: Preact signals use `.value` access for tracking. Our proxy model tracks arbitrary property access. The subscription model is fundamentally different — preact tracks signal objects, we track (target, property) pairs. Building on preact would mean wrapping every property in a signal internally, which is wasteful and complex.

**Alternative considered**: Keep `@preact/signals-core` and use proxies only as a facade. Rejected — the proxy needs to intercept arbitrary nested property access and create signal-per-property on the fly. This is essentially reimplementing reactive() anyway but with extra layers.

### 3. Babel plugin wraps element arguments in thunks

The plugin currently transforms:
```ts
div(expr1, expr2, expr3)
→ elem("div", [expr1, expr2, expr3])
```

Updated to:
```ts
div(expr1, expr2, expr3)
→ elem("div", [() => expr1, () => expr2, () => expr3])
```

Each expression is wrapped in `() => expr` so it's evaluated lazily inside an effect in the mount system, not eagerly in the component body.

**Static literal optimization** (optional, can defer): String literals, number literals, boolean literals, and `null`/`undefined` don't need wrapping — they can never be reactive. The plugin can detect these AST node types and skip wrapping. But wrapping them is harmless (the effect runs once, detects no deps, never re-fires), so this is a perf optimization, not a correctness requirement.

**`on()` calls**: EventBinding arguments created via `on("click", handler)` should still be wrapped in thunks. The handler itself is not reactive, but the EventBinding could theoretically be inside a conditional. The mount system handles EventBinding via classification regardless.

### 4. Mount system uses effects per-argument

`processArg` is rewritten:

```ts
function processArg(element: HTMLElement, arg: Content, disposers: Undo[]) {
  if (typeof arg === "function") {
    // Thunk from babel — evaluate inside effect
    let currentUndo: Undo = () => {}
    const dispose = effect(() => {
      currentUndo()
      const value = arg()
      currentUndo = applyResolved(element, value, disposers)
    })
    disposers.push(() => { dispose(); currentUndo() })
    return
  }

  // Static value (literal that wasn't wrapped, or manual construction)
  applyResolved(element, arg, disposers)
}

function applyResolved(element: HTMLElement, value: Content, disposers: Undo[]): Undo {
  if (isSignal(value)) {
    // Backward compat: signal passthrough
    let currentUndo: Undo = () => {}
    const unsub = value.subscribe((v: Content) => {
      currentUndo()
      currentUndo = applyResolved(element, v, disposers)
    })
    disposers.push(() => unsub())
    return currentUndo
  }

  const classified = classify(value)
  if (!classified) return () => {}
  if (classified.kind === "array") {
    const undos: Undo[] = []
    for (const item of classified.items) {
      processArg(element, item, disposers)
    }
    return () => { for (const u of undos) u() }
  }
  return apply(element, classified, disposers)
}
```

The key change: thunks (functions) are evaluated inside `effect()`. When reactive properties read during evaluation change, the effect re-runs, undoes the old DOM state, and applies the new state.

### 5. `computed()` remains for derived state definitions

`computed()` is still the right tool for derived values defined outside templates:

```ts
const activeCount = computed(() => state.todos.filter(t => !t.completed).length)
const filteredTodos = computed(() => {
  if (state.filter === "active") return state.todos.filter(t => !t.completed)
  if (state.filter === "completed") return state.todos.filter(t => t.completed)
  return state.todos
})
```

These are defined once and passed into templates as values. Inside a thunk, reading `activeCount` (if it's a computed/signal) triggers tracking. If it's just a plain value returned by `computed()`, the thunk's effect tracks the underlying reactive properties that `computed()` reads.

### 6. TodoMVC state uses `reactive()` with object-of-reactive-objects pattern

```ts
type Todo = { id: number, title: string, completed: boolean }

const state = reactive({
  todos: [] as Todo[],
  filter: "all" as Filter,
  editingId: null as number | null,
})
```

Each todo is a plain object. When added to `state.todos`, the deep proxy makes `todo.completed` and `todo.title` individually trackable. Mutations are plain assignment: `todo.completed = true`, `state.filter = "active"`.

Array mutations replace the array: `state.todos = [...state.todos, newTodo]`. This triggers re-evaluation of any effect that read `state.todos`. Full list teardown/rebuild — acceptable at TodoMVC scale, list reconciliation deferred.

## Risks / Trade-offs

- **[Full list re-render on array mutation]** → Same limitation as before. `state.todos = [...]` tears down and rebuilds the entire todo list. Mitigation: acceptable at TodoMVC scale; list reconciliation is a separate future change.

- **[Proxy performance overhead]** → Every property access goes through a proxy trap. Mitigation: proxy overhead is ~10-50ns per access in V8, negligible for UI code. Vue 3 proves this at scale.

- **[Deep proxy complexity]** → Nested objects must be recursively proxied. Need to handle edge cases: arrays, `Date`, `Map`/`Set`, circular references. Mitigation: start with plain objects and arrays only. Use a `WeakMap` cache to avoid re-proxying the same object.

- **[Thunk allocation overhead]** → Every element argument creates a closure. Mitigation: closure allocation is ~5ns in V8. Effects that read no reactive state run once and are never re-triggered (near-zero ongoing cost). This is the same approach Solid uses.

- **[Breaking change to mount system]** → Existing code using `signal()`/`computed()` with `isSignal()` in `processArg` must still work. Mitigation: `isSignal()` fallback kept in `applyResolved`. Both old and new patterns work simultaneously.

- **[Replacing `@preact/signals-core`]** → Losing a battle-tested library. Mitigation: the custom reactive primitive is small (~100 lines), the semantics are well-understood (Vue 3's model), and we only need `reactive()`, `computed()`, `effect()`, `batch()`.
