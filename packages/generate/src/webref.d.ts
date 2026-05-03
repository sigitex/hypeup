/** biome-ignore-all lint/suspicious/noExplicitAny: it's ok */
declare module "@webref/elements" {
  export function listAll(): Promise<Record<string, ElementsReference>>

  export interface ElementsReference {
    spec: {
      title: string
      url: string
    }
    elements: RefElement[]
  }

  export interface RefElement {
    name: string
    interface: string
  }
}

declare module "@webref/css" {
  export function listAll(): Promise<CssReference>
  export function index(): Promise<any>

  export interface CssReference {
    properties: RefProperty[]
    atrules: RefAtrule[]
    functions: RefFunction[]
    types: RefType[]
    selectors: any[]
  }

  export interface RefFeatureBase {
    name: string
    href: string
    prose?: string
    syntax?: string
    for?: string[]
    extended?: any[]
  }

  export interface RefProperty extends RefFeatureBase {
    initial?: string
    appliesTo?: string
    inherited?: string
    percentages?: string
    computedValue?: string
    canonicalOrder?: string
    animationType?: string
    media?: string
    legacyAliasOf?: string
    styleDeclaration?: string[]
  }

  export interface RefAtrule extends RefFeatureBase {
    descriptors: RefAtruleDescriptor[]
    value?: string
  }

  export interface RefAtruleDescriptor extends RefFeatureBase {
    initial?: string
  }

  export interface RefFunction extends RefFeatureBase {}
  export interface RefType extends RefFeatureBase {}
}
