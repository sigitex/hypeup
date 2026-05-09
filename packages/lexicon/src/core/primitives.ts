// oxlint-disable typescript/consistent-type-definitions
import type {
  Attr,
  CssClass,
  Element,
  Property,
  Raw,
  Rule
} from "@hypeup/runtime"
import type { Each, EventBinding, Ref } from "@hypeup/vdom"

export * from "../primitives.gen"

declare global {
  interface GlobalEventHandlersEventMap {}
  interface Event {}
  // oxlint-disable-next-line typescript/no-explicit-any
  type Content = any

  function elem(tag: string, ...contents: Content[]): Element
  function elemVoid(tag: string, ...contents: Content[]): Element
  function prop(name: string, value: Content): Property
  function attr(name: string, value: Content): Attr
  function raw(x: Content): Raw
  const rule: {
    /** Create a CSS rule with a selector. */
    (selector: string, ...contents: Content[]): Rule
    /** Create a `rule` CSS property. `css-gaps-1` */
    (value: Content): Property
    /** Dot-syntax class selector shorthand: `rule.active(...)` becomes `rule(".active", ...)` */
    [className: string]: (...contents: Content[]) => Rule
  }
  function className(...names: [string, ...string[]]): CssClass[]
  function cssString(text: string): string
  const doctype: { html5: Raw }
  function on<K extends keyof GlobalEventHandlersEventMap>(
    event: K,
    handler: (e: GlobalEventHandlersEventMap[K]) => void,
  ): EventBinding
  function on(event: string, handler: (e: Event) => void): EventBinding
  function redraw(): void
  function ref<T extends HTMLElement = HTMLElement>(): Ref<T>
  function each<T>(
    items: T[],
    keyFn: (item: T, index: number) => unknown,
    mapFn: (item: T, index: number) => Element,
    context?: unknown,
  ): Each<T>
  function each<T>(
    items: T[],
    mapFn: (item: T, index: number) => Element,
  ): Each<T>
}
