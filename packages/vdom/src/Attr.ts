// oxlint-disable typescript/no-explicit-any

/** HTML attribute node. */
export class Attr {
  name: string
  value: any

  constructor(name: string, value: any) {
    this.name = name
    this.value = value
  }
}
