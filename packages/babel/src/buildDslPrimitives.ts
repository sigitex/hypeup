import {
  atRules,
  cssProperties,
  htmlTags,
  voidHtmlTags,
} from "@hypeup/lexicon/primitives"
import type {
  HypeupExtension,
  ExtensionSymbol,
  PropSymbol,
  ClassNameSymbol,
  ElementSymbol,
} from "./HypeupExtension"

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
export type BuiltinPrimitive = {
  kind: "builtin"
  name: string
  module?: string
}

export type PropConstantPrimitive = Omit<PropSymbol, "type"> & {
  kind: "prop-constant"
}
export type ClassNameConstantPrimitive = Omit<ClassNameSymbol, "type"> & {
  kind: "className-constant"
}
export type ElementConstantPrimitive = Omit<ElementSymbol, "type"> & {
  kind: "element-constant"
  isVoid: boolean
}

export type Primitive =
  | HtmlElementPrimitive
  | AtRulePrimitive
  | CssPropertyPrimitive
  | BuiltinPrimitive
  | PropConstantPrimitive
  | ClassNameConstantPrimitive
  | ElementConstantPrimitive

/** Build an O(1) lookup table of all DSL primitives. */
export function buildDslPrimitives(extensions: HypeupExtension[] = []): Map<string, Primitive> {
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

  // Builtins (runtime)
  const builtins = [
    "elem",
    "elemVoid",
    "prop",
    "attr",
    "raw",
    "rule",
    "className",
    "cssString",
    "doctype",
    "each",
    "lazy",
  ]
  for (const name of builtins) {
    table.set(name, { kind: "builtin", name })
  }

  // Builtins (client)
  const clientHelpers = ["on", "redraw", "ref"]
  for (const name of clientHelpers) {
    table.set(name, { kind: "builtin", name, module: "@hypeup/client" })
  }

  const reservedRoots = new Set(table.keys())
  const definitions = new Map<string, ExtensionSymbol>()
  for (const extension of extensions) {
    for (const [name, symbol] of Object.entries(extension)) {
      if (reservedRoots.has(name.split(".")[0])) {
        throw new Error(`Extension symbol "${name}" uses a reserved built-in root`)
      }
      if (definitions.has(name)) {
        throw new Error(`Duplicate extension symbol "${name}"`)
      }
      definitions.set(name, symbol)
    }
  }

  for (const [name, symbol] of definitions) {
    switch (symbol.type) {
      case "prop":
        table.set(name, { kind: "prop-constant", css: symbol.css, value: symbol.value })
        break
      case "className":
        table.set(name, { kind: "className-constant", value: symbol.value })
        break
      case "element":
        table.set(name, {
          kind: "element-constant",
          tag: symbol.tag,
          className: symbol.className,
          props: symbol.props,
          attrs: symbol.attrs,
          isVoid: (voidHtmlTags as readonly string[]).includes(symbol.tag),
        })
        break
    }
  }

  for (const name of definitions.keys()) {
    resolveAlias(name, definitions, table, new Set())
  }

  return table
}

function resolveAlias(
  name: string,
  definitions: Map<string, ExtensionSymbol>,
  table: Map<string, Primitive>,
  resolving: Set<string>,
): Primitive {
  const primitive = table.get(name)
  if (primitive) {
    return primitive
  }
  const symbol = definitions.get(name)
  if (!symbol || symbol.type !== "alias") {
    throw new Error(`Missing extension alias target "${name}"`)
  }
  if (resolving.has(name)) {
    throw new Error(`Extension alias cycle: ${[...resolving, name].join(" -> ")}`)
  }
  resolving.add(name)
  const target = resolveAlias(symbol.target, definitions, table, resolving)
  resolving.delete(name)
  table.set(name, target)
  return target
}
