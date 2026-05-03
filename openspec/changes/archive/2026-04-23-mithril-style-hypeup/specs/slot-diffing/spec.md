## ADDED Requirements

### Requirement: Slot-level diffing compares classified args
During redraw, the differ SHALL walk the new vdom element's args in parallel with the previous mount's recorded slot list. Each new arg SHALL be classified and compared against the corresponding previous slot's classification.

#### Scenario: Text slot unchanged
- **WHEN** the previous slot is `kind: "text", value: "hello"` and the new arg classifies identically
- **THEN** no DOM operation SHALL be performed for that slot

#### Scenario: Text slot value changed
- **WHEN** the previous slot is `kind: "text", value: "hello"` and the new arg classifies as `kind: "text", value: "world"`
- **THEN** the existing Text node's `.data` SHALL be set to `"world"` with no node creation

#### Scenario: Class slot value changed
- **WHEN** the previous slot is `kind: "class", name: "active"` and the new arg classifies as `kind: "class", name: "inactive"`
- **THEN** `classList.remove("active")` and `classList.add("inactive")` SHALL be called

#### Scenario: Style slot value changed
- **WHEN** the previous slot is `kind: "style", name: "color", value: "red"` and the new value is `"blue"`
- **THEN** `style.setProperty("color", "blue")` SHALL be called

#### Scenario: Kind changed (text to class)
- **WHEN** the previous slot was `kind: "text"` and the new arg classifies as `kind: "class"`
- **THEN** the old text node SHALL be removed and the new class SHALL be applied

#### Scenario: Child element diffed recursively
- **WHEN** a slot contains a child Element with the same tag as the previous child
- **THEN** the differ SHALL recurse into the child and diff its slots rather than recreating the child DOM node

#### Scenario: Child element tag changed
- **WHEN** a slot's child Element has a different tag than the previous child
- **THEN** the old child DOM node SHALL be removed and a new one created

#### Scenario: Null/false slot transitions
- **WHEN** a slot transitions from a classified value to `null`/`false` (or vice versa)
- **THEN** the old slot SHALL be undone (or the new value applied) correctly
