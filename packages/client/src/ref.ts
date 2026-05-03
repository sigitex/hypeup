import { Ref } from "@hypeup/vdom"

/** Create an element reference for capturing a DOM handle. */
export function ref<T extends HTMLElement = HTMLElement>(): Ref<T> {
  return new Ref<T>()
}
