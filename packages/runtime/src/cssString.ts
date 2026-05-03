import cssesc from "cssesc"

/** Escape a string for safe use in CSS string contexts. */
export function cssString(value: string): string {
  return cssesc(value, { wrap: true })
}
