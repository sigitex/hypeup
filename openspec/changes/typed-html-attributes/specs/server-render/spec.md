## ADDED Requirements

### Requirement: Boolean attributes render as presence-only HTML
When classified element attributes contain a value of `true`, the HTML renderer SHALL emit only the attribute name without a value. Attributes omitted by classification SHALL not render.

#### Scenario: True object boolean attribute renders without value
- **WHEN** `render(input({ disabled: true }))` is called
- **THEN** the output SHALL be `<input disabled>`

#### Scenario: False object boolean attribute is omitted
- **WHEN** `render(input({ disabled: false }))` is called
- **THEN** the output SHALL be `<input>`

#### Scenario: True Attr renders without value
- **WHEN** `render(input(attr("disabled", true)))` is called
- **THEN** the output SHALL be `<input disabled>`

#### Scenario: Textual false attribute still renders
- **WHEN** `render(div({ contenteditable: "false" }))` is called
- **THEN** the output SHALL be `<div contenteditable="false"></div>`
