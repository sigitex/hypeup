// oxlint-disable typescript/no-explicit-any

/** Representation of a CSS rule. */
export class Rule {
  selector: string
  contents: any[]

  constructor(selector: string, contents: any[]) {
    this.selector = selector
    this.contents = contents
  }
}
