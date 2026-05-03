// oxlint-disable typescript/no-explicit-any

/** Virtual HTML element. */
export class Element {
  tag: string
  isVoid: boolean
  contents: any[]

  constructor(tag: string, isVoid: boolean, contents: any[]) {
    this.tag = tag
    this.isVoid = isVoid
    this.contents = contents
  }
}
