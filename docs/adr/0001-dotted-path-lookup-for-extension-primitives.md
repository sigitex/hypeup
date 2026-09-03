# Dotted-path lookup for extension primitives

Extension-defined element constants can register dotted paths (e.g., `container.sm`) as independent primitive table entries. When the babel plugin encounters a member-expression chain rooted at a known identifier, it checks for the longest matching dotted path in the table before falling back to the existing behavior of treating dot segments as className additions.

This was chosen over a "separator/join strategy" approach where `container.sm` would mechanically concatenate segments (e.g., `container-sm`). The join approach would bake in a naming convention and limit what dotted paths can express. Independent entries are simpler — each dotted path is just another key in the primitive table with its own full definition. The plugin doesn't need to know about naming conventions; the extension author controls exactly what each path expands to.

## Considered Options

- **Separator field** (`separator: "-"`) on element constants, where `container.sm` auto-generates `container-sm`. Rejected because it couples the plugin to a naming convention and can't handle cases where the dotted variant has different attrs/props than the base.
- **No dotted paths** — require separate top-level identifiers for every variant. Rejected because `container.sm` reads better than `containerSm` and mirrors how CSS frameworks organize variants.
