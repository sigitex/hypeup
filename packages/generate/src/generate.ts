import discoverCss from "./discoverCss"
import discoverHtml from "./discoverHtml"
import { generateCss } from "./generateCss"
import { generateHtml } from "./generateHtml"
import { generatePrimitives } from "./generatePrimitives"

main()

async function main() {
  const elements = discoverHtml()
  const { properties, atrules } = await discoverCss()

  const html = generateHtml()
  const css = await generateCss()
  const primitives = generatePrimitives({ elements, properties, atrules })

  await Bun.write("src/html.gen.ts", html)
  await Bun.write("src/css.gen.ts", css)
  await Bun.write("src/primitives.gen.ts", primitives)
}
