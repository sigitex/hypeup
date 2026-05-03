/** biome-ignore-all lint/suspicious/noNonNullAssertedOptionalChain: it's ok */
/** biome-ignore-all lint/suspicious/noPrototypeBuiltins: it's ok */
import { listAll as getCssRefs, type RefType } from "@webref/css"
import { definitionSyntax, type DSNodeGroup } from "css-tree"
import { all as knownCssProperties } from "known-css-properties"

export default async function discoverCss() {
  const properties: SpecProperty[] = []
  const propLookup: Record<string, SpecProperty | undefined> = {}

  const refs = await getCssRefs()

  // Index types by name for fast lookup. v8 may have multiple types with the
  // same name (disambiguated by `for`); we prefer the unscoped one.
  const typesByName = new Map<string, RefType>()
  for (const t of refs.types) {
    if (t.for && typesByName.has(t.name)) {
      continue
    }
    typesByName.set(t.name, t)
  }

  for (const refProp of refs.properties) {
    const spec = hrefToSpec(refProp.href)

    let property = propLookup[refProp.name]
    if (!property) {
      property = propLookup[refProp.name] = {
        name: refProp.name,
        jsName: camelize(jsName(refProp.name)),
        specs: [],
        values: [],
      }
      properties.push(property)
    }
    property.specs.push(spec)

    if (refProp.syntax) {
      const parsed = definitionSyntax.parse(refProp.syntax)
      for (const refValue of parsed.terms) {
        definitionSyntax.walk(refValue, {
          enter(node) {
            if (node.type === "Keyword" && /^[a-z]/.test(node.name)) {
              addValue(property!, "keyword", node.name, spec, undefined)
            } else if (node.type === "Type" && node.name === "color") {
              addValue(property!, "color", node.name, spec, undefined)
            } else if (node.type === "Type") {
              for (const value of expandTypeKeywords(node.name)) {
                addValue(property!, "keyword", value, spec, undefined)
              }
            }
          },
        })
      }
    }
  }

  // Collect properties from known-css-properties

  const unknownSpec: Spec = {
    title: "Unknown Specification",
    shortName: "unknown-spec",
  }

  for (const name of knownCssProperties) {
    if (propLookup.hasOwnProperty(name)) {
      continue
    }
    if (name.startsWith("-epub")) {
      continue
    }

    properties.push({
      name,
      jsName: camelize(jsName(name)),
      specs: [unknownSpec],
      values: [],
    })
  }

  properties.sort((a, b) => a.name.localeCompare(b.name))

  // Collect colors from the <named-color> type's syntax.
  const colors = [...expandTypeKeywords("named-color")].filter(
    (c) => c !== "none",
  )

  // Collect at-rules. In v8, subsidiary at-rules are reported at the root with
  // a `for` field scoping them to a parent; filter those out to preserve the
  // previous behavior of listing only top-level at-rules.
  const atrulesDefined: { [name: string]: boolean | undefined } = {}
  const atrules = refs.atrules
    .filter((a) => !a.for)
    .map((atrule) => ({
      name: atrule.name.substring(1),
      jsName: camelize(jsName(atrule.name.substring(1))),
      help: atrule.prose,
    }))
    .filter((atrule) => {
      const duplicate = !!atrulesDefined[atrule.name]
      atrulesDefined[atrule.name] = true
      return !duplicate
    })

  return {
    properties,
    colors,
    atrules,
  }

  /** Parse a type's syntax and yield its top-level keyword alternatives. */
  function expandTypeKeywords(typeName: string): Set<string> {
    const out = new Set<string>()
    const type = typesByName.get(typeName)
    if (!type?.syntax) {
      return out
    }
    let parsed: DSNodeGroup
    try {
      parsed = definitionSyntax.parse(type.syntax)
    } catch {
      return out
    }
    definitionSyntax.walk(parsed, {
      enter(node) {
        if (node.type === "Keyword" && /^[a-z]/.test(node.name)) {
          out.add(node.name)
        }
      },
    })
    return out
  }
}

function addValue(
  property: SpecProperty,
  type: SpecValue["type"],
  name: string,
  spec: Spec,
  help: string | undefined,
) {
  const original = property.values.find((v) => v.name === name)
  if (!original) {
    property!.values.push({
      type,
      name,
      jsName: camelize(jsName(name)),
      helps: [{ spec, help }],
    })
  } else {
    if (original.helps.some((h) => h.spec.shortName === spec.shortName)) {
      return
    }
    original.helps.push({
      spec,
      help: help === original.helps[0].help ? undefined : help,
    })
  }
}

/** Derive a pseudo-spec from a feature's defining URL. */
function hrefToSpec(href: string): Spec {
  try {
    const url = new URL(href)
    const parts = url.pathname.split("/").filter(Boolean)
    const shortName = parts[parts.length - 1] || url.hostname
    return { shortName, title: shortName }
  } catch {
    return { shortName: "unknown-spec", title: "Unknown Specification" }
  }
}

export type Spec = {
  title: string
  shortName: string
}

export type SpecProperty = {
  name: string
  jsName: string
  specs: Spec[]
  values: SpecValue[]
}

export type SpecValue = {
  name: string
  jsName: string
  type: "keyword" | "color"
  helps: SpecValueHelp[]
}

export type SpecValueHelp = {
  spec: Spec
  help?: string
}

export type SpecAtrule = {
  name: string
  jsName: string
  help?: string
}

const keywords = new Set(["continue", "default", "super", "break", "in"])

/** Formats a variable name. */
function jsName(property: string) {
  switch (true) {
    case keywords.has(property):
      return `_${property}`
    case property.startsWith("-"):
      return property.substring(1)
  }
  return property.replace(" ", "_")
}

/** Turn a kebab-case name into camelCase. */
function camelize(kebab: string) {
  return kebab.replace(/-./g, ([, c]) => c.toUpperCase())
}
