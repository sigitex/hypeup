## 1. EventBinding Node Type

- [x] 1.1 Create `EventBinding` class in `@hypeup/vdom` (`vdom/src/EventBinding.ts`) with `event: string` and `handler: Function` fields
- [x] 1.2 Export `EventBinding` from `vdom/src/index.ts`
- [x] 1.3 Add `EventBinding` to `vdom/src/nodes.test.ts` — verify construction and field access

## 2. Client Event Support

- [x] 2.1 Add `{ kind: "event"; event: string; handler: Function }` variant to `Classified` union in `client/src/classify.ts`
- [x] 2.2 Add `instanceof EventBinding` branch to `classify()` returning `{ kind: "event", ... }`
- [x] 2.3 Add `case "event"` to `apply()` in `client/src/apply.ts` — `addEventListener` + undo via `removeEventListener`
- [x] 2.4 Create `on(event, handler)` helper function in `client/src/on.ts` returning `new EventBinding(event, handler)`
- [x] 2.5 Export `on` from `client/src/index.ts`

## 3. Server-Side Skip

- [x] 3.1 Update `@hypeup/runtime` classifier (`runtime/src/classify.ts`) to skip `EventBinding` instances (return null or equivalent)

## 4. Example Scaffold

- [x] 4.1 Create `todomvc/` directory with `package.json` (`@hypeup/todomvc`, deps: `@hypeup/client`, `@hypeup/vdom`, `@hypeup/lexicon`, `@hypeup/plugin`, `vite`, `todomvc-app-css`)
- [x] 4.2 Verify `todomvc/` is picked up by the `*` workspace glob in root `package.json`
- [x] 4.3 Create `todomvc/index.html` with root mount point and TodoMVC CSS link
- [x] 4.4 Create `todomvc/vite.config.ts` with `@hypeup/plugin/vite`
- [x] 4.5 Create `todomvc/tsconfig.json`

## 5. TodoMVC State Layer

- [x] 5.1 Create `todomvc/src/state.ts` — `Todo` type (`{ id, title: Signal<string>, completed: Signal<boolean> }`), `todos` signal, `filter` signal, `filteredTodos` computed, `activeCount` computed, `allCompleted` computed
- [x] 5.2 Implement `addTodo(title)` — trim, validate non-empty, push new todo, update signal
- [x] 5.3 Implement `removeTodo(id)` — filter out by id, update signal
- [x] 5.4 Implement `toggleTodo(id)` — flip `completed.value` on matching todo
- [x] 5.5 Implement `toggleAll()` — if any active, mark all completed; else mark all active
- [x] 5.6 Implement `clearCompleted()` — filter out completed todos
- [x] 5.7 Implement `editTodo(id, newTitle)` — trim, if empty then remove, else update `title.value`

## 6. TodoMVC UI Components

- [x] 6.1 Create `todomvc/src/app.ts` — top-level `todoApp()` function returning the `.todoapp` section element
- [x] 6.2 Implement header component — `h1("todos")` + new-todo input with `on("keydown", ...)` for Enter key
- [x] 6.3 Implement todo item component — checkbox with `on("change", ...)`, label with `on("dblclick", ...)`, destroy button with `on("click", ...)`, edit input with `on("keydown", ...")` and `on("blur", ...)`
- [x] 6.4 Implement main section — toggle-all checkbox + `computed` todo list rendering from `filteredTodos`
- [x] 6.5 Implement footer component — active count display, filter links (`#/`, `#/active`, `#/completed`), clear-completed button (conditionally shown via `computed`)
- [x] 6.6 Implement editing mode — `signal<number | null>` for editing ID, conditional `.editing` class, edit input focus management

## 7. Entry Point and Hash Routing

- [x] 7.1 Create `todomvc/src/main.ts` — import lexicon, mount app to DOM, set up `hashchange` listener to update `filter` signal
- [x] 7.2 Parse initial hash on load to set correct filter state

## 8. Verification

- [x] 8.1 Run Vite dev server and verify the app loads without build errors
- [x] 8.2 Manually verify: add, toggle, edit, delete, filter, clear completed, toggle all
- [x] 8.3 Verify empty state hides main/footer sections
- [x] 8.4 Verify active count displays correct singular/plural form
