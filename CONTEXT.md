# hypeup

A TypeScript DSL framework where HTML elements, CSS properties, and other primitives are used as bare identifiers — no imports required. A babel plugin transforms these identifiers into runtime helper calls.

## Language

### Primitives & Extensions

**Primitive**:
An identifier recognized by the babel plugin and transformed into a runtime helper call. Built-in primitives include HTML elements, CSS properties, at-rules, and builtins.
_Avoid_: keyword, token, symbol (when referring to the transformable unit)

**Primitive Table**:
The `Map<string, Primitive>` lookup built at plugin init time. Maps identifier names to their primitive definitions. Extension entries are merged into this table after built-ins.
_Avoid_: symbol table, registry

**Extension**:
A `HypeupExtension` object — a flat `Record<string, ExtensionSymbol>` where each key is an identifier name (possibly dotted, e.g., `"container.sm"`) and each value is a discriminated union by `type`. Extensions are the unit of configuration — each is self-contained. The plugin accepts an array of extensions.
_Avoid_: plugin (overloaded with babel plugin), addon

**Extension Symbol**:
A single entry in an extension, discriminated by `type`: `"alias"` (maps to existing primitive), `"prop"` (expands to `prop(css, value)`), `"className"` (expands to `className(value)`), or `"element"` (expands to `elem(tag, [...prebakedChildren, ...userChildren])` — void inferred from tag). Dotted keys (e.g., `"m4.x"`) are first-class — they participate in dotted-path lookup. Element symbols carry optional `className` (single string), `props` (`Record<string, string>`), and `attrs` (`Record<string, string | boolean>`).
_Avoid_: macro, token, constant (when referring to the general concept — use "extension symbol")

### Transform Mechanics

**Dotted-Path Lookup**:
When the plugin encounters a member-expression chain rooted at a known identifier (e.g., `container.sm`), it checks the primitive table for the longest matching dotted path before falling back to root-match-plus-segments behavior. Unlimited depth. No root entry required — `"m4.x"` can exist without `"m4"`. Scope shadowing of the root identifier suppresses the entire chain. Implemented inside the existing `Identifier` visitor, not a separate `MemberExpression` visitor. Dot-segment fallback (unmatched segments become classNames) only applies to element symbols and aliases that target element-like primitives — prop and className constants have no dot-segment fallback.
_Avoid_: namespace lookup, qualified name

**Prebaked Children**:
The className, props, and attrs that an element symbol injects into the `elem()` call's children array before any user-supplied children. Ordering: prebaked children first, then dot-segment classNames, then user arguments.
_Avoid_: default children, built-in children
