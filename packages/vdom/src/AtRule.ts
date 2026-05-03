// oxlint-disable typescript/no-explicit-any

/** Represents at-rules. */
export class AtRule {
  keyword: string
  rule: string | null
  contents: any[]

  constructor(keyword: string, rule: string | null, contents: any[]) {
    this.keyword = keyword
    this.rule = rule
    this.contents = contents
  }
}
