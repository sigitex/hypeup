export type HypeupExtension = Record<string, ExtensionSymbol>

export type ExtensionSymbol =
  | AliasSymbol
  | PropSymbol
  | ClassNameSymbol
  | ElementSymbol

export type AliasSymbol = { type: "alias"; target: string }
export type PropSymbol = { type: "prop"; css: string; value: string }
export type ClassNameSymbol = { type: "className"; value: string }
export type ElementSymbol = {
  type: "element"
  tag: string
  className?: string
  props?: Record<string, string>
  attrs?: Record<string, string | boolean>
}
