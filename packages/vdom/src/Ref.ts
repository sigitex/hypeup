declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface HTMLElement {}
}

/** Element reference — captures a handle to the DOM element it's passed to. */
export class Ref<T extends HTMLElement = HTMLElement> {
  current: T | null = null
}
