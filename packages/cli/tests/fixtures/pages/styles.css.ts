import { Rule, Property } from "@hypeup/vdom"

export default function styles() {
  return [
    new Rule("body", [
      new Property("margin", "0"),
      new Property("font-family", "sans-serif"),
    ]),
    new Rule(".container", [
      new Property("max-width", "800px"),
    ]),
  ]
}
