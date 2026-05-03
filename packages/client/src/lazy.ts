import { Lazy } from "@hypeup/vdom"

/** Create a Lazy vdom node wrapping a component function and its arguments. */
export function lazy(fn: Function, args: unknown[]): Lazy {
  return new Lazy(fn, args)
}
