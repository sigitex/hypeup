import type { Element } from "./Element"

/** Callable element constructor that supports dot-chained CSS class names. */
export interface ElementBuilder<Content = any> {
  (...contents: Content[]): Element
  [className: string]: ElementBuilder<Content>
}
