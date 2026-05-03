## 1. Reactive Primitive

- [x] 1.1 Create `client/src/reactive.ts` — implement `reactive<T>(obj: T): T` with Proxy-based deep tracking, `WeakMap` cache for nested proxy identity
- [x] 1.2 Implement dependency tracking — global `currentEffect` context, proxy `get` trap registers effect, proxy `set` trap notifies subscribers via `(target, property)` pairs
- [x] 1.3 Handle arrays — proxy array index access, `length`, and iteration methods (`map`, `filter`, `forEach`, etc.)
- [x] 1.4 Add tests for `reactive()` — basic read/write, nested objects, arrays, proxy identity stability, type preservation

## 2. Effect System

- [x] 2.1 Create `client/src/effect.ts` — implement `effect(fn): Dispose` that runs `fn`, tracks reactive reads, re-runs on change
- [x] 2.2 Implement dependency cleanup on re-run — effect re-execution re-tracks dependencies, old deps unsubscribed
- [x] 2.3 Implement `computed(fn)` — lazy cached derived value, trackable inside effects, works with both `reactive()` and `signal()` reads
- [x] 2.4 Implement `batch(fn)` — defer effect execution until batch completes, deduplicate pending effects
- [x] 2.5 Add tests for `effect()` — immediate execution, re-run on dep change, no re-run for unread deps, dispose, conditional dep cleanup
- [x] 2.6 Add tests for `computed()` — derivation, caching, reactive tracking inside effects
- [x] 2.7 Add tests for `batch()` — single effect run for multiple writes

## 3. Babel Plugin — Thunk Wrapping

- [x] 3.1 Update `handleHtmlElement` in `babel/src/hypeupBabelPlugin.ts` — wrap each user-provided argument in `() => expr` arrow function expression
- [x] 3.2 Ensure `className()` calls from class chain lowering are NOT wrapped in thunks
- [x] 3.3 Update void element handling (`elemVoid`) — same thunk wrapping for arguments
- [x] 3.4 Add/update babel plugin tests — verify thunk wrapping output for simple calls, class chains, void elements, nested elements, CSS properties unchanged

## 4. Mount System — Effect-Based Processing

- [x] 4.1 Update `client/src/mount.ts` `processArg` — add `typeof arg === "function"` branch that evaluates thunk inside `effect()` with undo/redo cycle
- [x] 4.2 Implement `applyResolved` — handles signal fallback via `isSignal()`, classifies value, applies to DOM, returns undo
- [x] 4.3 Ensure effect disposal is tracked in `disposers` array for cleanup on unmount
- [x] 4.4 Remove or deprecate the existing `isSignal()` subscription path in `processArg` (keep `isSignal()` fallback inside `applyResolved`)

## 5. Client Exports

- [x] 5.1 Export `reactive`, `effect`, `batch` from `client/src/index.ts`
- [x] 5.2 Keep `signal`, `computed`, `isSignal` exports for backward compatibility
- [x] 5.3 Export `Signal`, `ReadonlySignal` types for backward compatibility

## 6. TodoMVC Rewrite

- [x] 6.1 Rewrite `todomvc/src/state.ts` — replace `signal()`/`computed()` with `reactive()` state object and `computed()` for derived values only
- [x] 6.2 Rewrite `todomvc/src/HeaderSection.ts` — remove `computed()` wrappers, use plain reactive expressions
- [x] 6.3 Rewrite `todomvc/src/TodoItem.ts` — remove `computed()` wrappers, use plain reactive state access for classes, attributes, conditionals
- [x] 6.4 Rewrite `todomvc/src/MainSection.ts` — remove `computed()` wrappers, use plain reactive expressions
- [x] 6.5 Rewrite `todomvc/src/FooterSection.ts` — remove `computed()` wrappers, use plain reactive expressions
- [x] 6.6 Update `todomvc/src/app.ts` — remove `computed()` wrappers for conditional main/footer rendering
- [x] 6.7 Update `todomvc/src/main.ts` — replace signal-based filter with reactive state

## 7. Verification

- [x] 7.1 Vite build succeeds with thunk-wrapped babel output
- [x] 7.2 Type-check passes (`tsc --noEmit`)
- [x] 7.3 All existing tests pass (vdom, babel)
- [x] 7.4 TodoMVC works in browser — add, toggle, edit, delete, filter, clear completed, toggle all
