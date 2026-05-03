## 1. Package Setup

- [x] 1.1 Create `@hypeup/client` package with `package.json` (dependencies: `@hypeup/vdom`, `@hypeup/runtime`, `@preact/signals-core`)
- [x] 1.2 Create `tsconfig.json` extending workspace config

## 2. Signals

- [x] 2.1 Implement `signal(value)` wrapper around `@preact/signals-core` Signal, exposing `.value` for read/write
- [x] 2.2 Implement `computed(fn)` wrapper around `@preact/signals-core` computed
- [x] 2.3 Implement `isSignal(value)` type guard that detects both signal and computed instances

## 3. Classification and Apply

- [x] 3.1 Implement `classify(arg)` — `instanceof` dispatch for Element, Property, Attr, CssClass, Raw, string, plain object, array
- [x] 3.2 Implement `apply(element, classified)` — DOM operations per kind (appendChild, style.setProperty, setAttribute, classList.add, innerHTML, createTextNode)
- [x] 3.3 Each `apply` operation returns an `undo` closure that reverses exactly what was applied

## 4. Mount

- [x] 4.1 Implement `mount(node)` — create DOM element, iterate `contents`, call `processArg` for each
- [x] 4.2 Implement `processArg(element, arg)` — classify static args directly; for signals, subscribe and apply undo/redo on change
- [x] 4.3 Handle arrays by flattening and recursing through `processArg`
- [x] 4.4 Track all subscriptions per mount call; return a disposer function that unsubscribes all

## 5. Phase 1 List Handling

- [x] 5.1 Implement full-list replacement for signal-of-array changes (remove all old children, mount and append all new)

## 6. Exports and Integration

- [x] 6.1 Create `src/index.ts` exporting `signal`, `computed`, `isSignal`, `mount`
- [x] 6.2 Verify package compiles with no TypeScript errors (`tsc --noEmit`)
