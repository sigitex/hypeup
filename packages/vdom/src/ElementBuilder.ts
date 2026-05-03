// oxlint-disable typescript/no-explicit-any
import type { Element } from "./Element"

/** Callable element constructor that supports dot-chained CSS class names. */
export type ElementBuilder = ((...contents: any[]) => Element) & {
  [className: string]: ElementBuilder
}
