## MODIFIED Requirements

### Requirement: each() is a pure vdom marker diffed during redraw
`each(items, keyFn, mapFn)` SHALL return an `Each` vdom node containing the items array, key function, and map function. During redraw diffing, the slot differ SHALL detect `Each` nodes and delegate to the keyed reconciler to diff the previous children against the new items.

#### Scenario: Initial render of each
- **WHEN** `each(items, i => i.id, i => li(i.label))` is mounted for the first time
- **THEN** one `<li>` DOM node SHALL be created per item

#### Scenario: Item appended on redraw
- **WHEN** an item is added to the array and `redraw()` is called
- **THEN** the reconciler SHALL detect the new key and create one new `<li>` DOM node

#### Scenario: Item removed on redraw
- **WHEN** an item is removed from the array and `redraw()` is called
- **THEN** the reconciler SHALL detect the missing key and remove the corresponding DOM node

#### Scenario: Items swapped on redraw
- **WHEN** two items are swapped in the array and `redraw()` is called
- **THEN** the reconciler SHALL move the two DOM nodes with minimal operations

#### Scenario: Item content changed on redraw
- **WHEN** an item's label property changes and `redraw()` is called
- **THEN** the reconciler SHALL reuse the existing DOM node for that key and the slot differ SHALL patch the text node inside it

### Requirement: each() does not create effects
`each()` SHALL NOT create outer effects, per-item effects, or any reactive subscriptions. It is a pure vdom node that is diffed during redraw.

#### Scenario: No effects created
- **WHEN** `each(items, keyFn, mapFn)` is mounted
- **THEN** zero effects SHALL be created; the reconciler runs only when `redraw()` is called
