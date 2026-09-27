import {
  Attr,
  CssClass,
  Each,
  Element,
  EventBinding,
  Lazy,
  Property,
  Raw,
  Ref,
} from "@hypeup/vdom"

// oxlint-disable-next-line typescript/no-explicit-any
type Content = any

export type Classified =
  | { kind: "child"; node: Element }
  | { kind: "each"; each: Each }
  | { kind: "lazy"; lazy: Lazy }
  | { kind: "style"; name: string; value: string }
  | { kind: "attribute"; name: string; value: unknown }
  | { kind: "class"; name: string }
  | { kind: "event"; event: string; handler: Function }
  | { kind: "raw"; html: string }
  | { kind: "text"; text: string }
  | { kind: "attributes"; entries: [string, unknown][] }
  | { kind: "ref"; ref: Ref }
  | { kind: "array"; items: Content[] }

/** Classify a single argument by instanceof dispatch. */
export function classify(arg: Content): Classified | null {
  if (arg === null || arg === undefined || arg === "" || arg === false) {
    return null
  }
  if (arg instanceof Element) {
    return { kind: "child", node: arg }
  }
  if (arg instanceof Each) {
    return { kind: "each", each: arg }
  }
  if (arg instanceof Lazy) {
    return { kind: "lazy", lazy: arg }
  }
  if (arg instanceof Property) {
    return { kind: "style", name: arg.name, value: String(arg.value) }
  }
  if (arg instanceof Attr) {
    return { kind: "attribute", name: arg.name, value: arg.value }
  }
  if (arg instanceof CssClass) {
    return { kind: "class", name: arg.name }
  }
  if (arg instanceof EventBinding) {
    return { kind: "event", event: arg.event, handler: arg.handler }
  }
  if (arg instanceof Raw) {
    return { kind: "raw", html: arg.text }
  }
  if (arg instanceof Ref) {
    return { kind: "ref", ref: arg }
  }
  if (Array.isArray(arg)) {
    return { kind: "array", items: arg }
  }
  if (typeof arg === "object" && arg !== null) {
    const entries: [string, unknown][] = []
    for (const key in arg) {
      entries.push([key, arg[key]])
    }
    return { kind: "attributes", entries }
  }
  return { kind: "text", text: String(arg) }
}
