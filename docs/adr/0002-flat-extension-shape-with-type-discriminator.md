# Flat extension shape with type discriminator

A `HypeupExtension` is a flat `Record<string, ExtensionSymbol>` where keys are identifier names (possibly dotted) and values are a union discriminated by `type`. This replaces an earlier design with separate `aliases`, `constants`, and `elements` fields.

The flat shape was chosen because dotted-path keys (e.g., `"m4.x"`, `"container.sm"`) are first-class and should work for any symbol type, not just element constants. Separate fields would mean either duplicating dotted-path support across fields or restricting it to one. A single namespace also means one collision check instead of checking across multiple fields.

## Considered Options

- **Separate fields** (`aliases`, `constants`, `elements`) — rejected because dotted-path keys would need to be supported independently in each field, and cross-field collision checking is more complex.
- **Nested discriminated constants with separate elements** — rejected as a half-measure; once dotted paths apply to constants too (e.g., `m4.x`), the distinction between "constant with dots" and "element with dots" is artificial.
