// oxlint-disable typescript/no-explicit-any
import {
  Attr,
  AtRule,
  CssClass,
  Each,
  Element,
  Lazy,
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

/** Create a keyed list node with explicit key function. */
export function each<T>(
  items: T[],
  keyFn: (item: T, index: number) => unknown,
  mapFn: (item: T, index: number) => Element,
  context?: unknown,
): Each<T>

/** Create an index-keyed list node (key defaults to array index). */
export function each<T>(
  items: T[],
  mapFn: (item: T, index: number) => Element,
): Each<T>

export function each<T>(
  items: T[],
  keyFnOrMapFn:
    | ((item: T, index: number) => unknown)
    | ((item: T, index: number) => Element),
  mapFnOrContext?: ((item: T, index: number) => Element) | unknown,
  context?: unknown,
): Each<T> {
  if (typeof mapFnOrContext === "function") {
    return new Each(
      items,
      keyFnOrMapFn as (item: T, index: number) => unknown,
      mapFnOrContext as (item: T, index: number) => Element,
      context,
    )
  }
  // Two-argument overload: use index as key
  return new Each(
    items,
    (_item: T, index: number) => index,
    keyFnOrMapFn as (item: T, index: number) => Element,
  )
}

/** Create a Lazy vdom node wrapping a component function and its arguments. */
export function lazy(fn: Function, args: unknown[]): Lazy {
  return new Lazy(fn, args)
}
