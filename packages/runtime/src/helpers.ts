// oxlint-disable typescript/no-explicit-any
import {
  Attr,
  AtRule,
  CssClass,
  Element,
  Property,
  Raw,
  Rule,
} from "@hypeup/vdom"

export function elem(tag: string, contents: any[]): Element {
  return new Element(tag, false, contents)
}

export function elemVoid(tag: string, contents: any[]): Element {
  return new Element(tag, true, contents)
}

export function prop(name: string, value: any): Property {
  return new Property(name, value)
}

export function attr(name: string, value: any): Attr {
  return new Attr(name, value)
}

export function raw(content: any): Raw {
  return new Raw(content)
}

export function rule(selector: string, contents: any[]): Rule {
  return new Rule(selector, contents)
}

export function atRule(
  keyword: string,
  ruleParam: string | null,
  contents: any[],
): AtRule {
  return new AtRule(keyword, ruleParam, contents)
}

export function className(...names: [string, ...string[]]): CssClass[] {
  return names.map(name => new CssClass(name))
}
