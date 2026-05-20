import type { Element } from "./Element"

/** Callable element constructor that supports dot-chained CSS class names. */
// oxlint-disable-next-line typescript/consistent-type-definitions, typescript/no-explicit-any
export interface ElementBuilder<Content = any> {
  (...contents: Content[]): Element
  [className: string]: ElementBuilder<Content>
}
