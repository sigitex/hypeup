// oxlint-disable typescript/no-explicit-any
import type { Element } from "./Element"

/** Virtual node representing a keyed list rendered via `each()`. */
export class Each<T = any> {
  items: T[]
  keyFn: (item: T, index: number) => unknown
  mapFn: (item: T, index: number) => Element
  context: unknown

  constructor(
    items: T[],
    keyFn: (item: T, index: number) => unknown,
    mapFn: (item: T, index: number) => Element,
    context?: unknown,
  ) {
    this.items = items
    this.keyFn = keyFn
    this.mapFn = mapFn
    this.context = context
  }
}
