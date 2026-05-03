## Context

hypeup uses a Mithril-style redraw model: on state change, the root component function re-runs, producing a fresh vdom tree that's diffed against the previous mount state. The `each()` primitive has an item-skip optimization that avoids re-diffing list items whose data reference hasn't changed. However, when external state (like `selected`) changes, a `context` parameter forces all items to re-diff — even though only 2 of 1000 rows may be visually affected.

The current architecture has no concept of "component boundaries" — PascalCase function calls like `TodoRow(todo)` are immediately evaluated, returning flat Element nodes. By the time the differ sees them, the component call has already happened and there's no opportunity to skip it.

The babel plugin already transforms DSL primitives (element calls, CSS properties, escape hatches). It can be extended to detect PascalCase component calls and defer their evaluation.

## Goals / Non-Goals

**Goals:**
- Enable per-component skip optimization based on argument comparison
- Zero DX change — users write the same code, babel handles the wrapping
- Fix benchmark 04 (select) regression — per-row arg comparison instead of full re-diff
- General-purpose: works for any PascalCase function call, not just inside `each()`

**Non-Goals:**
- Component lifecycle hooks (mount, unmount, update callbacks)
- Component-scoped state or local redraw
- Automatic closure analysis (detecting which global state a component reads)
- Replacing the `each()` context parameter — they're complementary

## Decisions

### 1. Lazy vdom node wraps function + args

A new `Lazy` class in `@hypeup/vdom` stores the component function reference and its arguments without calling it:

```ts
class Lazy {
  fn: Function
  args: unknown[]
}
```

On first mount, the runtime calls `fn(...args)`, mounts the result, and stores the MountHandle. On diff, it shallow-compares each arg (`===`). If all match, the entire subtree is skipped.

**Why**: This is the minimal data needed for skip-by-comparison. The function reference identifies the component type (like React's element type), and the args are the "props" equivalent.

**Alternative considered**: Storing the vdom result alongside for comparison. Rejected — the point is to avoid calling the function at all when args match.

### 2. Babel wraps all PascalCase calls with args

The babel plugin wraps any call expression where:
- The callee is a PascalCase identifier (first char uppercase): `TodoRow(...)`, `Header(...)`, `Button(...)`
- The call has at least one argument (zero-arg calls are excluded — see Decision 4)
- The identifier is not a known JS built-in (`String`, `Number`, `Boolean`, `Object`, `Array`, `Date`, `Map`, `Set`, `Promise`, `Error`, `RegExp`)

Transform: `TodoRow(todo, isSelected)` → `lazy(TodoRow, [todo, isSelected])`

This wrapping happens **regardless of position** — inside element trees, in variable assignments, in return statements. This is safe because:
- On first mount, `Lazy` is always evaluated (`fn(...args)` called, result processed normally)
- On diff, same fn + same args = skip (correct: same inputs → same output)
- Outside the mount system, the only risk is someone inspecting `.tag` on the return value, which doesn't happen in practice

**Why PascalCase**: Universal JS/TS convention for components. Lowercase = elements/helpers, uppercase = components. Same heuristic React/JSX uses.

**Why no positional analysis**: Detecting "inside an element tree" is fragile — the plugin transforms element calls before component calls are processed, making parent detection unreliable. Wrapping everywhere is simpler and harmless.

**Alternative considered**: Only wrap inside `elem()` args arrays. Rejected — adds detection complexity for no practical benefit, since wrapping is safe in all positions.

### 3. Shallow arg comparison with `===`

Each arg is compared with strict equality. If any arg differs, the component re-runs.

```ts
function argsEqual(prev: unknown[], next: unknown[]): boolean {
  if (prev.length !== next.length) return false
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) return false
  }
  return true
}
```

**Why `===`**: Same as React's approach with `React.memo`. Reference equality is O(1) per arg, predictable, and works with the immutable-update pattern users already follow.

**Trade-off**: Components that receive the same object reference but with mutated properties won't re-run. This is by design — it enforces the "new reference = new data" contract.

### 4. Zero-arg components always re-run

A PascalCase call with no arguments — `Header()` — is NOT wrapped in `lazy`. It's called immediately and its result is used as a regular vdom node.

**Why**: Zero-arg components typically read from closed-over state. With no args to compare, there's no way to determine if the output changed. Wrapping them would cause them to never update (empty args always match).

**Alternative considered**: Wrap them and always re-run (`lazy` with a special "no-skip" flag). Rejected — adds complexity for no benefit. The user can add args to opt in: `Header(activeCount())`.

### 5. SlotRecord kind: "lazy" stores MountHandle + prev args

```ts
{ kind: "lazy"; fn: Function; args: unknown[]; handle: MountHandle }
```

The differ checks:
- Same `fn` reference? Compare `args`. Same args → skip. Different → re-run fn, diff result.
- Different `fn`? Dispose old handle, mount new.

### 6. Interaction with each() item-skip

Both optimizations are complementary:
- **Item-skip**: skips `mapFn` call + diff when item data reference is unchanged (regardless of what mapFn does internally)
- **Lazy skip**: skips component call + diff when all arguments are unchanged

When a component like `TodoRow(todo, isSelected)` is used inside `each()`:
- Item-skip fires first (item reference unchanged → skip the entire slot including the lazy node)
- If item changed but lazy args match the previous call → lazy skip fires
- If args differ → component re-runs and result is diffed

For the select benchmark specifically, the `context` parameter would no longer be needed. Instead:
```ts
each(state.data, d => d.id, d => TodoRow(d, state.selected === d.id))
```
When `state.selected` changes, item-skip doesn't fire (item references unchanged but context... actually item-skip WOULD fire since item references are unchanged). The lazy node for `TodoRow(d, state.selected === d.id)` would compare `[d, false]` vs `[d, true]` for the affected rows — only the 2 rows where `isSelected` flipped would re-run.

Wait — the item-skip fires first and would skip the lazy eval entirely since item refs are unchanged. So we need the item-skip to NOT fire when there's a lazy node that might have different args. The solution: when the slot is a lazy node, the item-skip should be disabled for that slot — the lazy node handles its own skipping via arg comparison.

Actually, the cleaner approach: once lazy wrapping is in place, the item-skip can check the lazy args instead of just the item reference. Or simpler: the item-skip stays as-is (comparing item data reference), and we rely on the `context` parameter to force re-evaluation when external state changes. The lazy node then provides per-row filtering within that re-evaluation.

## Risks / Trade-offs

**[PascalCase false positives]** A PascalCase function that isn't a component (e.g., `Date()`, `Map()`) could be incorrectly wrapped. → Mitigation: Only wrap calls that appear as element children AND whose identifier is unbound (not imported from a known module). Built-in constructors are typically not used as element children.

**[Argument identity sensitivity]** If a user creates new objects on every render as args (e.g., `TodoRow({ ...todo, extra: true })`), the lazy skip never fires. → Mitigation: Same trade-off as React.memo — users learn to stabilize references. The pattern is well-established.

**[Interaction with item-skip]** The item-skip in `each()` operates before lazy nodes are evaluated. If item reference is unchanged, the lazy node is never reached. → Mitigation: This is correct behavior for pure item-data-dependent components. For components that depend on external state, the `context` parameter forces re-evaluation, at which point the lazy skip provides per-row filtering.

**[Bundle size]** The `lazy()` wrapper adds a function call + array allocation per component invocation on every render. → Mitigation: These are lightweight operations. The savings from skipping subtree diffs vastly outweigh the allocation cost.

## Open Questions

- Should the babel plugin wrap PascalCase calls inside `each()` mapFn bodies, or only direct element children? Wrapping inside mapFn enables per-row component skipping but adds complexity to the transform.
- Should there be an explicit opt-out for PascalCase functions that shouldn't be wrapped (e.g., a `/** @nolazy */` comment annotation)?
