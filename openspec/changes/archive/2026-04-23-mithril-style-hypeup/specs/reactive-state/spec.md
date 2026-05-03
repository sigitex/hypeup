## REMOVED Requirements

### Requirement: reactive() creates a deeply reactive proxy
**Reason**: Replaced by plain JS objects. The Mithril-style redraw model eliminates the need for automatic dependency tracking. State mutations are reflected on the next `redraw()` call.
**Migration**: Remove `reactive()` wrappers. Use plain objects: `const state = { count: 0 }` instead of `const state = reactive({ count: 0 })`.
