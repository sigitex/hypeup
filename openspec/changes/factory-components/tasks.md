## 1. SSR Renderer — Factory Support

- [ ] 1.1 In `render.ts` `Lazy` case, add factory detection: if `typeof result === "function"`, call the result to get the Element before rendering
- [ ] 1.2 Add test: pure Lazy node renders to HTML (existing behavior preserved)
- [ ] 1.3 Add test: factory Lazy node renders to HTML (factory called, then view called, result rendered)

## 2. Client Mount — Factory Detection and Storage

- [ ] 2.1 Extend the lazy `SlotRecord` / `MountHandle` type to store an optional `viewFn` for factory components
- [ ] 2.2 In `mountElement` lazy handling, after calling `lazy.fn(...args)`, detect factory via `typeof result === "function"` — store the view function, call it, and mount the resulting Element
- [ ] 2.3 Ensure pure Lazy mount path is unchanged (no viewFn stored)

## 3. Client Diff — Factory Redraw Logic

- [ ] 3.1 In lazy slot diffing: when args are unchanged and slot has a stored `viewFn`, skip factory re-invocation but call `viewFn()` and diff the result
- [ ] 3.2 In lazy slot diffing: when args changed and slot has a stored `viewFn`, re-invoke factory with new args, store new `viewFn`, call it, and diff
- [ ] 3.3 In lazy slot diffing: when `fn` reference changed, dispose old handle and mount fresh (works for both pure and factory)
- [ ] 3.4 Pure Lazy unchanged-args skip (no function call, no diff) continues to work as before

## 4. Client Tests — Factory Components

- [ ] 4.1 Add test: factory component mounts and renders initial view
- [ ] 4.2 Add test: factory component closure state persists across redraws
- [ ] 4.3 Add test: multiple factory instances have independent state
- [ ] 4.4 Add test: factory args unchanged — factory not re-invoked, view called and diffed
- [ ] 4.5 Add test: factory args changed — factory re-invoked, new view stored
- [ ] 4.6 Add test: factory fn changed — old disposed, new mounted fresh
- [ ] 4.7 Add test: pure Lazy components still work unchanged alongside factory components
