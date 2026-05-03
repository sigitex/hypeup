## Context

`@hypeup/client` currently exports `signal`, `computed`, `isSignal`, and `mount`. The mount pipeline (classify → apply with undo closures) handles elements, attributes, styles, classes, raw HTML, text, and reactive signals. However, there is no mechanism for attaching DOM event listeners, no example app exercising the full stack, and list rendering with signals has not been tested in a real scenario.

The TodoMVC specification is a well-defined, non-trivial application that requires: reactive state management, conditional rendering, list rendering with add/remove/update, DOM event handling (click, keyboard, blur), and derived computations (active count, filtered list). It is an ideal validation target.

The build pipeline (`@hypeup/babel` + `@hypeup/plugin`) transforms the DSL's ambient globals into runtime helper calls. Vite + `@hypeup/plugin/vite` is the intended dev/build setup.

## Goals / Non-Goals

**Goals:**
- Validate `@hypeup/client`'s mount/signal/classify/apply pipeline with a real application
- Establish a pattern for DOM event handling that fits the DSL's heterogeneous-argument model
- Demonstrate idiomatic state management with leaf-level signals and computed values
- Produce a reference example for future users of the framework
- Exercise list rendering with `signal(array)` + re-render on mutation

**Non-Goals:**
- List reconciliation / diffing (full list replace via undo/redo is acceptable for v1)
- SSR or hydration
- TodoMVC CSS authoring — use the standard `todomvc-app-css` stylesheet
- Performance optimization (batching, lazy effects)
- Routing (hash-based filter is local state, not a router)

## Decisions

### 1. Event handling: `on` helper function in `@hypeup/client`

Event listeners don't fit the existing classify/apply model — they aren't visual content (children, attributes, styles, classes). Rather than overloading classification, introduce a dedicated `on(event, handler)` helper that returns an opaque object recognized by the classifier.

**Approach**: Add an `EventBinding` class to `@hypeup/vdom` (or a lightweight marker in `@hypeup/client`). The classifier recognizes it via `instanceof` and the apply function calls `element.addEventListener`. The undo closure calls `removeEventListener`.

```
on("click", handler)  →  EventBinding { event: "click", handler }
classify(binding)      →  { kind: "event", event: "click", handler }
apply(...)             →  addEventListener + return removeEventListener undo
```

**Alternative considered**: Passing event handlers as `{ onclick: fn }` attribute objects. Rejected because the existing attribute-object classification converts values to strings via `String(val)`, which destroys function references. Changing that behavior risks breaking the existing attribute path.

**Alternative considered**: Keeping event binding entirely outside the DSL (manual `element.addEventListener` after mount). Rejected because it breaks composability — the whole point of the DSL is that everything about an element lives in its argument list.

### 2. Event binding lives in `@hypeup/vdom` as a node type

`EventBinding` is a vdom node class alongside `Element`, `Property`, `Attr`, `CssClass`, `Raw`. This keeps classification uniform (`instanceof` dispatch) and makes event bindings work identically in static and reactive contexts (a signal-of-EventBinding swaps handlers reactively).

### 3. State architecture: single state object with leaf-level signals

Following the pattern from `plan-fe-runtime.md`:

```ts
const todos = signal<Todo[]>([])
const filter = signal<"all" | "active" | "completed">("all")
const filteredTodos = computed(() => { ... })
const activeCount = computed(() => { ... })
```

Each todo item is a plain object with signal fields (`{ id, title: signal(string), completed: signal(boolean) }`). This gives per-field granularity for edits and toggles.

List mutations (add/remove) replace the entire array in the `todos` signal. The undo/redo slot model re-renders the full list. This is acceptable for TodoMVC scale and defers list reconciliation to a future change.

### 4. Example lives in `todomvc/` as `@hypeup/todomvc`

Top-level workspace package with its own `package.json`, Vite config, and `index.html`. Sits alongside the library packages (`client/`, `vdom/`, etc.) and demonstrates the intended consumer setup.

### 5. Build setup: Vite + `@hypeup/plugin/vite`

The standard consumer setup per the roadmap. The example doubles as an integration test for the full build pipeline.

### 6. Conditional rendering via computed signals

Visibility of sections (main, footer) and conditional classes (completed, editing) are handled by computed signals that return the appropriate DSL value or `false`/`null` (which classify filters out as no-ops).

```ts
const mainSection = computed(() => 
  todos.value.length > 0 ? section(".main", ...) : false
)
```

## Risks / Trade-offs

- **[Full list re-render on mutation]** → Acceptable at TodoMVC scale (~100 items max). The undo/redo model tears down and rebuilds all children when the `todos` signal changes. Mitigation: this is a known v1 limitation; list reconciliation is planned for Phase 2 of the FE runtime.

- **[EventBinding is a new vdom node type]** → Adds a concept to `@hypeup/vdom` that the server-side renderer must handle (or ignore). Mitigation: `render.ts` classification simply skips `EventBinding` — events are client-only by nature. No server-side impact.

- **[No existing tests for the build pipeline integration]** → The example depends on `@hypeup/plugin/vite` working correctly. If the babel transform has issues, the example won't build. Mitigation: the example itself serves as the integration test; failures surface immediately.

- **[Hash-based filtering without a router]** → Listening to `hashchange` for filter state is manual but matches the TodoMVC spec exactly. No risk — this is the standard approach for TodoMVC.
