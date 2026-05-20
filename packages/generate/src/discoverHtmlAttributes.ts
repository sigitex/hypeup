import { htmlElementAttributes } from "html-element-attributes"
import {
  enumeratedAttributes,
  type Definition as EnumeratedDefinition,
} from "html-enumerated-attributes"
import bcd from "@mdn/browser-compat-data"
import { html, type Info } from "property-information"

export type AttributeValueKind =
  | { type: "boolean" }
  | { type: "number" }
  | { type: "enumerated"; values: string[]; loose: boolean }
  | { type: "string" }

export type HtmlAttributeSpec = {
  name: string
  value: AttributeValueKind
  help: string
}

export type HtmlAttributeDiscovery = {
  globalAttributes: HtmlAttributeSpec[]
  attributesByTag: Record<string, HtmlAttributeSpec[]>
}

type CompatLike = {
  mdn_url?: string
  spec_url?: string | string[]
  status?: {
    deprecated?: boolean
    experimental?: boolean
    standard_track?: boolean
  }
}

export function discoverHtmlAttributes(tags: string[]): HtmlAttributeDiscovery {
  const globalNames = new Set(htmlElementAttributes["*"] ?? [])
  const globalAttributes = [...globalNames].sort().map((name) => {
    return createAttributeSpec(name, undefined, true)
  })

  const attributesByTag: Record<string, HtmlAttributeSpec[]> = {}
  for (const tag of tags) {
    const names = new Set(htmlElementAttributes[tag] ?? [])
    for (const globalName of globalNames) {
      names.delete(globalName)
    }
    attributesByTag[tag] = [...names].sort().map((name) => {
      return createAttributeSpec(name, tag, false)
    })
  }

  return { globalAttributes, attributesByTag }
}

function createAttributeSpec(
  name: string,
  tag: string | undefined,
  isGlobal: boolean,
): HtmlAttributeSpec {
  const normalizedName = normalizeAttributeName(name)
  const info = findAttributeInfo(normalizedName)
  const enumerated = findEnumeratedDefinition(normalizedName, tag)
  const compat = findCompat(normalizedName, tag, isGlobal)

  return {
    name: normalizedName,
    value: toValueKind(info, enumerated),
    help: createHelp(normalizedName, tag, compat, enumerated),
  }
}

function normalizeAttributeName(name: string) {
  const propertyName = html.normal[name.toLowerCase().replace(/[^a-z0-9]/g, "")]
  const info = propertyName ? html.property[propertyName] : undefined
  return info?.attribute ?? name.toLowerCase()
}

function findAttributeInfo(name: string): Info | undefined {
  const propertyName = html.normal[name.toLowerCase().replace(/[^a-z0-9]/g, "")]
  return propertyName ? html.property[propertyName] : undefined
}

function findEnumeratedDefinition(
  name: string,
  tag: string | undefined,
): EnumeratedDefinition | undefined {
  const definitions = enumeratedAttributes[name]
  if (!definitions) {
    return undefined
  }
  const list = Array.isArray(definitions) ? definitions : [definitions]
  if (!tag) {
    return list.find((definition) => !definition.selector)
  }
  return list.find((definition) => appliesToTag(definition, tag))
}

function appliesToTag(definition: EnumeratedDefinition, tag: string | undefined) {
  if (!definition.selector || !tag) {
    return true
  }
  return definition.selector.split(",").map((selector) => selector.trim()).includes(tag)
}

function toValueKind(
  info: Info | undefined,
  enumerated: EnumeratedDefinition | undefined,
): AttributeValueKind {
  if (enumerated) {
    return {
      type: "enumerated",
      values: extractStates(enumerated).sort(),
      loose: enumerated.allowUnknown === true,
    }
  }
  if (info?.boolean) {
    return { type: "boolean" }
  }
  if (info?.number) {
    return { type: "number" }
  }
  return { type: "string" }
}

function extractStates(definition: EnumeratedDefinition) {
  const states = new Set<string>()
  for (const state of definition.states) {
    if (state === null) {
      continue
    }
    if (Array.isArray(state)) {
      for (const alias of state) {
        states.add(alias)
      }
    } else {
      states.add(state)
    }
  }
  return [...states]
}

function findCompat(
  name: string,
  tag: string | undefined,
  isGlobal: boolean,
): CompatLike | undefined {
  if (isGlobal) {
    return bcd.html.global_attributes[name]?.__compat as CompatLike | undefined
  }
  if (!tag) {
    return undefined
  }
  return bcd.html.elements[tag]?.[name]?.__compat as CompatLike | undefined
}

function createHelp(
  name: string,
  tag: string | undefined,
  compat: CompatLike | undefined,
  enumerated: EnumeratedDefinition | undefined,
) {
  const scope = tag ? `\` ${name}\` attribute for \`<${tag}>\`.` : `Global \`${name}\` HTML attribute.`
  const parts = [scope]
  if (enumerated) {
    const values = extractStates(enumerated)
    if (values.length > 0) {
      parts.push(`Known values: ${values.map((value) => `\`${value}\``).join(", ")}.`)
    }
  }
  if (compat?.mdn_url) {
    parts.push(`MDN: ${compat.mdn_url}`)
  }
  const specUrl = Array.isArray(compat?.spec_url) ? compat?.spec_url[0] : compat?.spec_url
  if (specUrl) {
    parts.push(`Spec: ${specUrl}`)
  }
  if (compat?.status?.deprecated) {
    parts.push("Deprecated.")
  }
  if (compat?.status?.experimental) {
    parts.push("Experimental.")
  }
  return parts.join(" ")
}
