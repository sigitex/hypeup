import tags, { voidHtmlTags } from "html-tags"

const keywords = new Set(["var"])

export default function discoverHtml() {
  return tags.map(name => ({
    name,
    isVoid: (voidHtmlTags as string[]).includes(name),
    jsName: keywords.has(name) ? `_${name}` : name,
    help: `Create a virtual \`${name}\` HTML element.`,
  }))
}


// oxlint-disable-next-line typescript/consistent-type-definitions
export interface ElementSpec {
  name: string
  isVoid: boolean
  jsName: string
  help: string
}