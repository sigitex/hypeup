## REMOVED Requirements

### Requirement: effect() creates a tracked reactive effect
**Reason**: No longer needed. The redraw model replaces automatic effect re-running with explicit `redraw()` calls.
**Migration**: Replace `effect(() => ...)` with direct state reads inside the component function. Side effects triggered by state changes should use event handlers or manual `redraw()` callbacks.

### Requirement: computed() creates a cached derived value
**Reason**: No reactive tracking to drive cache invalidation. Derived values can be computed inline in the component function (re-evaluated on each redraw).
**Migration**: Replace `computed(() => expr)` with a plain function or inline expression in the component.

### Requirement: batch() defers effect execution
**Reason**: No effects to batch. Multiple state mutations between redraws are naturally batched since `redraw()` is called once after all mutations.
**Migration**: Remove `batch()` calls. Multiple mutations before a single `redraw()` are already efficient.
