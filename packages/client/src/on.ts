import { EventBinding } from "@hypeup/vdom"
import { redraw } from "./redraw"

/** Create an event binding that auto-redraws after the handler executes. */
export function on(event: string, handler: Function): EventBinding {
  const wrapped = (e: Event) => {
    try {
      ;(handler as (e: Event) => void)(e)
    } finally {
      redraw()
    }
  }
  return new EventBinding(event, wrapped)
}

/** Create an event binding that skips auto-redraw. */
export namespace on {
  export function silent(event: string, handler: Function): EventBinding {
    return new EventBinding(event, handler)
  }
}
