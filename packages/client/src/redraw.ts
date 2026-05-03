/** Module-level redraw state. */
let currentRedraw: (() => void) | null = null

/** Register the current mount's redraw function. */
export function setRedrawTarget(fn: () => void): void {
  currentRedraw = fn
}

/** Clear the redraw target (on dispose). */
export function clearRedrawTarget(): void {
  currentRedraw = null
}

/** Trigger a redraw of the current mounted component. */
export function redraw(): void {
  if (currentRedraw) {
    currentRedraw()
  }
}
