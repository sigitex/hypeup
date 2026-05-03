import {
  atRules,
  cssProperties,
  htmlTags,
  voidHtmlTags,
} from "@hypeup/lexicon/primitives"

export type HtmlElementPrimitive = {
  kind: "htmlElement"
  tag: string
  isVoid: boolean
}
export type AtRulePrimitive = { kind: "atRule"; keyword: string }
export type CssPropertyPrimitive = {
  kind: "cssProperty"
  cssName: string
  keywords: readonly string[]
}
export type EscapeHatchPrimitive = {
  kind: "escapeHatch"
  name: string
  module?: string
}

export type Primitive =
  | HtmlElementPrimitive
  | AtRulePrimitive
  | CssPropertyPrimitive
  | EscapeHatchPrimitive

/** Build an O(1) lookup table of all DSL primitives. */
export function buildTable(): Map<string, Primitive> {
  const table = new Map<string, Primitive>()

  // HTML elements (non-void)
  for (const tag of htmlTags) {
    table.set(tag, { kind: "htmlElement", tag, isVoid: false })
  }

  // HTML elements (void) — overwrites any non-void entry for same tag
  for (const tag of voidHtmlTags) {
    table.set(tag, { kind: "htmlElement", tag, isVoid: true })
  }

  // Keyword collision: _var -> <var> tag
  table.set("_var", { kind: "htmlElement", tag: "var", isVoid: false })

  // At-rules: $media -> "@media", etc.
  for (const [name, keyword] of Object.entries(atRules) as [string, string][]) {
    table.set(name, { kind: "atRule", keyword })
  }

  // CSS properties
  for (const [name, data] of Object.entries(cssProperties) as [
    string,
    { cssName: string; keywords: readonly string[] },
  ][]) {
    table.set(name, {
      kind: "cssProperty",
      cssName: data.cssName,
      keywords: data.keywords,
    })
  }

  // Keyword collision: _continue -> CSS property "continue"
  const continueData = cssProperties._continue
  if (continueData) {
    table.set("_continue", {
      kind: "cssProperty",
      cssName: continueData.cssName,
      keywords: continueData.keywords,
    })
  }

  // Escape hatches (runtime)
  const escapeHatches = [
    "elem",
    "elemVoid",
    "prop",
    "attr",
    "raw",
    "rule",
    "className",
    "cssString",
    "doctype",
  ]
  for (const name of escapeHatches) {
    table.set(name, { kind: "escapeHatch", name })
  }

  // Escape hatches (client)
  const clientHelpers = ["on", "redraw", "ref", "each", "lazy"]
  for (const name of clientHelpers) {
    table.set(name, { kind: "escapeHatch", name, module: "@hypeup/client" })
  }

  return table
}
