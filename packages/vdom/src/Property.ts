// oxlint-disable typescript/no-explicit-any

/** Representation of a CSS property/value. */
export class Property {
  name: string
  value: any

  constructor(name: string, value: any) {
    this.name = name
    this.value = value
  }
}
