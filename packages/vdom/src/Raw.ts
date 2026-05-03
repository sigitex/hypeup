// oxlint-disable typescript/no-explicit-any

/** Unescaped HTML content. */
export class Raw {
  text: string

  constructor(content: any) {
    this.text = content === null || content === undefined ? "" : String(content)
  }
}
