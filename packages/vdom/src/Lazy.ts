/** Lazy vdom node — defers component evaluation until mount/diff. */
export class Lazy {
  fn: Function
  args: unknown[]

  constructor(fn: Function, args: unknown[]) {
    this.fn = fn
    this.args = args
  }
}
