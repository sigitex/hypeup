export type ElementState = {
  attributes: Record<string, string | true>
  properties: Record<string, string>
  classes: string[]
}

export namespace ElementState {
  export function create(): ElementState {
    return {
      attributes: Object.create(null),
      properties: Object.create(null),
      classes: [],
    }
  }

  export function attribute(state: ElementState, name: string, value: unknown): void {
    if (value === false || value === null || value === undefined) {
      delete state.attributes[name]
      if (name === "class") {
        state.classes.length = 0
      }
      return
    }
    if (name === "class" && value !== true) {
      state.classes.push(...String(value).split(/\s+/).filter(Boolean))
      return
    }
    state.attributes[name] = value === true ? true : String(value)
  }

  export function finish(state: ElementState): void {
    if (state.classes.length > 0) {
      state.attributes.class = state.classes.join(" ")
    }
  }
}
