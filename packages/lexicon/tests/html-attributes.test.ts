import "../src/index"

function htmlAttributeTypeCoverage() {
  div({ id: "main", class: "container" })

  input({ placeholder: "Email" })
  // @ts-expect-error placeholder is not valid on div.
  div({ placeholder: "Email" })

  input({ readonly: true, maxlength: 20 })
  input({ readonly: false, maxlength: "20" })
  // @ts-expect-error object attributes use HTML spelling, not DOM aliases.
  input({ readOnly: true, maxLength: 20 })

  input({ type: "password" })
  // @ts-expect-error input.type is a strict enumerated value.
  input({ type: "definitely-not-an-input-type" })

  a({ target: "_blank" })
  a({ target: "preview-window" })

  input({ disabled: true })
  input({ disabled: false })
  div({ contenteditable: "false" })
  // @ts-expect-error contenteditable false is textual, not boolean.
  div({ contenteditable: false })

  div(attr("custom-attr", "value"))
  elem("my-widget", attr("custom-attr", "value"))
}

void htmlAttributeTypeCoverage
