/** Convert camelCase to kebab-case. */
export const kebab = (s: string) =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
