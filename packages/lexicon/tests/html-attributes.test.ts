import "../src/index"

export function htmlAttributeTypeCoverage() {
  div({ id: "main", class: "container" })
  button({ "aria-label": "Close" })
  div({ "data-state": "open" })

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
  a.pdf.noprint({ href: "cv.pdf" }, "PDF")
  link({ rel: "icon", type: "image/png", href: "/favicon.png" })

  input({ disabled: true })
  input({ disabled: false })
  div({ contenteditable: "false" })
  div({ contenteditable: false })
  div({ title: true, tabindex: true, spellcheck: true })
  div({ title: false, tabindex: false, spellcheck: false })
  div({ title: null, tabindex: null, spellcheck: null })
  div({ title: undefined, tabindex: undefined, spellcheck: undefined })
  div({ tabindex: 0, spellcheck: "" })
  div({ tabindex: "0", spellcheck: "false" })
  div({ spellcheck: "true" })
  div({ class: false, "data-state": null, "aria-hidden": undefined })
  div({ class: null, "data-state": false, "aria-hidden": true })
  input({ disabled: null })
  input({ disabled: undefined })
  // @ts-expect-error
  div({ tabindex: "banana" })
  // @ts-expect-error
  div({ spellcheck: "yes" })
  // @ts-expect-error
  input({ disabled: "false" })

  div(attr("custom-attr", "value"))
  elem("my-widget", attr("custom-attr", "value"))

  type ProjectStatus = { name: string }
  const statuses: ProjectStatus[] = []
  div(each(statuses, status => div(status.name)))
  div(Math.random() > 0.5 ? each(statuses, status => div(status.name)) : undefined)
  rule(body, backgroundColor.white)
}
