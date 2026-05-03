## REMOVED Requirements

### Requirement: Babel plugin wraps reactive expressions in thunks
**Reason**: Thunk wrapping existed to defer evaluation of reactive reads into a tracking context. With no tracking context (no effects, no proxies), thunk wrapping is unnecessary. The babel plugin only needs to rewrite global DSL identifiers.
**Migration**: Remove the thunk-wrapping visitor from the babel plugin. Keep only the identifier rewriting visitor.
