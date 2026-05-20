import type { Element } from "./Element"

/** Callable element constructor that supports dot-chained CSS class names. */
export type ElementBuilder<Content = unknown> = ((...contents: Content[]) => Element) & {
  [className: string]: ElementBuilder<Content>
}
