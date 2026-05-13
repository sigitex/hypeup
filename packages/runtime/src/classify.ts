// oxlint-disable typescript/no-explicit-any
// oxlint-disable complexity
import {
  Attr,
  AtRule,
  CssClass,
  Each,
  Element,
  EventBinding,
  Lazy,
  Property,
  Raw,
  Rule,
} from "@hypeup/vdom"

type ElementSlots = {
  attributes: Record<string, string>
  properties: Record<string, string>
  classes: string[]
  children: any[]
}

type RuleSlots = {
  properties: Record<string, string>
  rules: Rule[]
  atRules: AtRule[]
  children: any[]
}

type AtRuleSlots = {
  properties: Record<string, string>
  children: any[]
}

/** Classify element contents into sorted slots. */
export function classifyElement(
  contents: any[],
  isVoid: boolean,
): ElementSlots {
  const slots: ElementSlots = {
    attributes: {},
    properties: {},
    classes: [],
    children: [],
  }
  walkElement(contents, slots, isVoid)
  return slots
}

/** Classify rule contents into sorted slots. */
export function classifyRule(contents: any[]): RuleSlots {
  const slots: RuleSlots = {
    properties: {},
    rules: [],
    atRules: [],
    children: [],
  }
  walkRule(contents, slots)
  return slots
}

/** Classify at-rule contents into sorted slots. */
export function classifyAtRule(contents: any[]): AtRuleSlots {
  const slots: AtRuleSlots = {
    properties: {},
    children: [],
  }
  walkAtRule(contents, slots)
  return slots
}

function walkElement(contents: any[], slots: ElementSlots, isVoid: boolean) {
  for (const item of contents) {
    if (isEmpty(item)) {
      continue
    }
    if (item instanceof EventBinding) {
      continue // event bindings are client-only
    }
    if (item instanceof Property) {
      slots.properties[item.name] = String(item.value)
    } else if (item instanceof Attr) {
      slots.attributes[item.name] = String(item.value)
    } else if (item instanceof CssClass) {
      slots.classes.push(item.name)
    } else if (
      item instanceof Element ||
      item instanceof Each ||
      item instanceof Lazy ||
      item instanceof Raw ||
      item instanceof Rule ||
      item instanceof AtRule
    ) {
      if (!isVoid) {
        slots.children.push(item)
      }
    } else if (Array.isArray(item)) {
      walkElement(item, slots, isVoid)
    } else if (typeof item === "object" && item !== null) {
      for (const key in item) {
        const val = item[key]
        if (!val) {
          continue
        }
        if (key === "class") {
          const classes = String(val).split(/\s+/).filter(Boolean)
          slots.classes.push(...classes)
        } else {
          if (slots.attributes[key]) {
            slots.attributes[key] += " " + String(val)
          } else {
            slots.attributes[key] = String(val)
          }
        }
      }
    } else if (!isVoid) {
      slots.children.push(String(item))
    }
  }
}

function walkRule(contents: any[], slots: RuleSlots) {
  for (const item of contents) {
    if (isEmpty(item)) {
      continue
    }
    if (item instanceof Property) {
      slots.properties[item.name] = String(item.value)
    } else if (item instanceof Rule) {
      slots.rules.push(item)
    } else if (item instanceof AtRule) {
      slots.atRules.push(item)
    } else if (item instanceof Raw) {
      slots.children.push(item)
    } else if (Array.isArray(item)) {
      walkRule(item, slots)
    }
    // CssClass, Attr, etc. silently ignored in rule context
  }
}

function walkAtRule(contents: any[], slots: AtRuleSlots) {
  for (const item of contents) {
    if (isEmpty(item)) {
      continue
    }
    if (item instanceof Property) {
      slots.properties[item.name] = String(item.value)
    } else if (item instanceof Rule || item instanceof AtRule || item instanceof Raw) {
      slots.children.push(item)
    } else if (Array.isArray(item)) {
      walkAtRule(item, slots)
    }
    // CssClass, Attr, etc. silently ignored in at-rule context
  }
}

function isEmpty(x: any): boolean {
  return x === undefined || x === null || x === "" || x === false
}
