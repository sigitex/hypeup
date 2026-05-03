## 1. Update Global Declaration

- [x] 1.1 Replace the `on` declaration in `lexicon/src/primitives.ts` with overloaded signatures: generic overload using `GlobalEventHandlersEventMap` + string fallback

## 2. Update TodoMVC (optional cleanup)

- [x] 2.1 Remove explicit `KeyboardEvent` annotation from `on("keydown", ...)` handler in `todomvc/src/TodoItem.ts`
- [x] 2.2 Remove explicit `FocusEvent` annotation from `on("blur", ...)` handler in `todomvc/src/TodoItem.ts`

## 3. Verification

- [x] 3.1 Type-check todomvc passes (`tsc --noEmit`) — event types infer correctly without annotations
- [x] 3.2 Existing tests pass
