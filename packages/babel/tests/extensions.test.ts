import { describe, expect, test } from "bun:test"
import { transformAsync } from "@babel/core"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"
import { render } from "@hypeup/render"
import { hypeupBabelPlugin, type HypeupExtension } from "../src"

const extensions: HypeupExtension[] = [{
  fs: { type: "alias", target: "fontSize" },
  cc: { type: "alias", target: "className" },
  divAlias: { type: "alias", target: "div" },
  m4: { type: "prop", css: "margin", value: "4px" },
  "m4.x": { type: "prop", css: "margin-inline", value: "4px" },
  active: { type: "className", value: "active" },
  "states.active": { type: "className", value: "active" },
  spacing: { type: "alias", target: "m4" },
  selected: { type: "alias", target: "active" },
  panel: { type: "element", tag: "div", className: "container" },
  "panel.sm": { type: "element", tag: "section", className: "container-sm" },
  "panel.sm.fluid": { type: "element", tag: "article", className: "fluid" },
  box: { type: "alias", target: "panel" },
  "tokens.small": { type: "prop", css: "padding", value: "2px" },
  logo: { type: "element", tag: "img", attrs: { src: "/logo.png" } },
}]

async function transform(code: string, definitions = extensions): Promise<string> {
  const result = await transformAsync(code, {
    filename: "extensions.js",
    configFile: false,
    babelrc: false,
    plugins: [hypeupBabelPlugin({ extensions: definitions })],
  })
  return result?.code ?? ""
}

async function renderExtension(code: string, definitions = extensions): Promise<string> {
  const result = await transformAsync(`const output = ${code}`, {
    filename: "extensions.js",
    configFile: false,
    babelrc: false,
    sourceType: "script",
    plugins: [hypeupBabelPlugin({ extensions: definitions })],
  })
  return render(runInNewContext(`${result?.code}; output;`, { require: createRequire(import.meta.url) }))
}

describe("extension aliases", () => {
  test.each([
    ['fs("14px")', 'fontSize("14px")'],
    ["fs.inherit", "fontSize.inherit"],
    ['cc("active")', 'className("active")'],
    ['divAlias("hello")', 'div("hello")'],
    ['divAlias.activeItem("hello")', 'div.activeItem("hello")'],
    ["divAlias", "div"],
    ["spacing", 'prop("margin", "4px")'],
    ["selected", 'className("active")'],
    ['box("hello")', 'panel("hello")'],
  ])("%s matches target output", async (source, target) => {
    expect(await transform(source)).toBe(await transform(target))
  })

  test("forward alias chains transform under reordered definitions", async () => {
    const definitions: HypeupExtension[] = [
      { token: { type: "alias", target: "smallToken" } },
      { smallToken: { type: "alias", target: "spacingToken" } },
      { spacingToken: { type: "prop", css: "margin", value: "4px" } },
    ]
    const expected = await transform("token", definitions)
    expect(expected).toContain('_prop("margin", "4px")')
    expect(await transform("token", definitions.toReversed())).toBe(expected)
    expect(await transform("token", [Object.assign({}, ...definitions)])).toBe(expected)
  })

  test("does not inherit target dotted family", async () => {
    expect(await renderExtension("box.sm")).toBe('<div class="container sm"></div>')
    expect(await renderExtension("panel.sm")).toBe('<section class="container-sm"></section>')
    expect(await renderExtension("box.sm", [...extensions, {
      "box.sm": { type: "element", tag: "aside", className: "explicit" },
    }])).toBe('<aside class="explicit"></aside>')
  })

  test.each([
    ['aliases.font("12px")', 'fontSize("12px")'],
    ["aliases.font.inherit", "fontSize.inherit"],
    ['aliases.element.activeItem("hello")', 'div.activeItem("hello")'],
    ['aliases.classes("active")', 'className("active")'],
    ['aliases.media("(min-width: 1px)", color("red"))', '$media("(min-width: 1px)", color("red"))'],
    ["aliases.doc.html5", "doctype.html5"],
    ['aliases.rule.active(color("red"))', 'rule.active(color("red"))'],
  ])("dotted alias %s preserves target syntax", async (source, target) => {
    const definitions: HypeupExtension[] = [{
      "aliases.font": { type: "alias", target: "fontSize" },
      "aliases.element": { type: "alias", target: "div" },
      "aliases.classes": { type: "alias", target: "className" },
      "aliases.media": { type: "alias", target: "$media" },
      "aliases.doc": { type: "alias", target: "doctype" },
      "aliases.rule": { type: "alias", target: "rule" },
    }]
    expect(await transform(source, definitions)).toBe(await transform(target, definitions))
  })
})

describe("extension constants and paths", () => {
  test.each([
    ["m4", '_prop("margin", "4px")'],
    ["div(m4)", '_elem("div", [_prop("margin", "4px")])'],
    ["m4.x", '_prop("margin-inline", "4px")'],
    ["active", '_className("active")'],
    ["states.active", '_className("active")'],
    ["tokens.small", '_prop("padding", "2px")'],
  ])("lowers %s", async (source, expected) => {
    expect(await transform(source)).toContain(expected)
  })

  test.each(["m4", "m4.x", "active", "states.active", "spacing", "selected"])("rejects calls of %s", async name => {
    await expect(transform(`${name}("value")`)).rejects.toThrow("Extension constants are not callable")
  })

  test.each([
    "m4.typo", "m4.x.typo", "active.typo", "states.active.typo",
    "spacing.typo", "selected.typo", "tokens.typo", "tokens.small.typo",
    "fs.typo", "fs.inherit.typo", "fs.inherit()",
  ])("rejects unresolved path %s", async source => {
    await expect(transform(source)).rejects.toThrow("Unresolved extension path")
  })

  test("bare dotted-only root remains untouched", async () => {
    expect(await transform("tokens")).toBe("tokens;")
  })

  test("registered paths beat aliases and constant prefixes", async () => {
    const definitions: HypeupExtension[] = [...extensions, {
      "fs.sm": { type: "prop", css: "font-size", value: "12px" },
      "m4.x.deep": { type: "className", value: "deep" },
    }]
    expect(await transform("fs.sm", definitions)).toContain('_prop("font-size", "12px")')
    expect(await transform("fs.inherit", definitions)).toContain('_prop("font-size", "inherit")')
    expect(await transform("m4.x.deep", definitions)).toContain('_className("deep")')
  })

  test.each([
    'tokens["small"]', "tokens[key]", "tokens?.small",
    'panel["sm"]', "panel[key]", "panel?.sm",
    'panel.sm["fluid"]', "panel.sm?.fluid", "panel.sm?.()",
    'm4["x"]', "m4?.x",
  ])("does not recognize unsupported path %s", async source => {
    const output = await transform(source)
    expect(output).not.toContain("@hypeup/runtime")
    expect(output).toBe(`${source};`)
  })

  test("supports unbounded registered path depth", async () => {
    const name = ["custom", ...Array.from({ length: 30 }, (_, index) => `part${index}`)].join(".")
    expect(await transform(name, [{ [name]: { type: "className", value: "deep" } }])).toContain('_className("deep")')
  })
})

describe("extension scope shadowing", () => {
  test.each([
    'const m4 = customFunction; m4("8px")',
    'const active = customFunction; active()',
    'const spacing = customFunction; spacing()',
    'const selected = customFunction; selected()',
    'const fs = customFunction; fs("14px")',
    'const m4 = { x: customFunction }; m4.x()',
    'const states = { active: customFunction }; states.active()',
    'const tokens = { typo: 1 }; tokens.typo',
    'const panel = customFunction; panel.sm.fluid.active("hello")',
    'function example(m4, tokens) { return [m4.typo, tokens.typo] }',
    'import { m4, panel } from "custom"; m4(); panel.sm()',
    'const { m4 } = custom; m4()',
  ])("preserves local bindings in %s", async source => {
    expect(await transform(source)).toBe(await transform(source, []))
  })

  test("preserves property names and labels", async () => {
    expect(await transform('const object = { m4: 1, active: 2 }; object.m4; active: while (false) { break active; }')).not.toContain("@hypeup/runtime")
  })
})

describe("extension elements", () => {
  test("call and bare forms emit predefined content without thunks", async () => {
    expect(await transform('panel("hello")')).toContain('_elem("div", [_className("container"), "hello"])')
    expect(await transform("panel")).toContain('_elem("div", [_className("container")])')
    expect(await renderExtension('panel("hello")')).toBe('<div class="container">hello</div>')
  })

  test("predefined class, props, attrs, chain classes, arguments stay ordered", async () => {
    const output = await transform('card.activeItem(className("caller"), "hello")', [{
      card: { type: "element", tag: "div", className: "base", props: { display: "flex" }, attrs: { role: "region" } },
    }])
    expect(output).toContain('_elem("div", [_className("base"), _prop("display", "flex"), _attr("role", "region"), _className("active-item"), _className("caller"), "hello"])')
  })

  test("longest dotted element match retains only unmatched classes", async () => {
    expect(await renderExtension('panel.sm.fluid.activeItem("hello")')).toBe('<article class="fluid active-item">hello</article>')
    expect(await renderExtension("panel.active")).toBe('<div class="container active"></div>')
    expect(await renderExtension("panel.sm.fluid")).toBe('<article class="fluid"></article>')
  })

  test("void element keeps caller attributes, properties, classes", async () => {
    const output = await transform('logo({ alt: "Brand" }, width("20px"), className("icon"))')
    expect(output).toContain('_elemVoid("img", [_attr("src", "/logo.png"), {')
    expect(await renderExtension('logo({ alt: "Brand" }, width("20px"), className("icon"))')).toBe('<img src="/logo.png" alt="Brand" class="icon" style="width: 20px">')
  })

  test.each(["img", "a"])("caller attributes replace defaults on %s", async tag => {
    const definitions: HypeupExtension[] = [{
      branded: { type: "element", tag, attrs: { src: "/logo.png", rel: "noopener" } },
    }]
    for (const args of ['{ src: "/brand.png", rel: "noreferrer" }', 'attr("src", "/brand.png"), attr("rel", "noreferrer")']) {
      expect(await renderExtension(`branded(${args})`, definitions)).toBe(`<${tag} src="/brand.png" rel="noreferrer">${tag === "img" ? "" : "</a>"}`)
    }
  })

  test("class sources accumulate and caller false clears predefined classes", async () => {
    const definitions: HypeupExtension[] = [{
      card: { type: "element", tag: "div", className: "base", attrs: { class: "preset" } },
    }]
    expect(await renderExtension('card.chain({ class: "caller" }, className("helper"))', definitions)).toBe('<div class="base preset chain caller helper"></div>')
    expect(await renderExtension('card({ class: false }, className("final"))', definitions)).toBe('<div class="final"></div>')
  })

  test.each(["button", "input"])("caller false removes predefined boolean attributes on %s", async tag => {
    const definitions: HypeupExtension[] = [{
      control: { type: "element", tag, attrs: { disabled: true } },
    }]
    for (const args of ["{ disabled: false }", 'attr("disabled", false)']) {
      expect(await renderExtension(`control(${args})`, definitions)).toBe(`<${tag}>${tag === "input" ? "" : "</button>"}`)
    }
  })

  test("spread arguments and nested extensions survive lowering", async () => {
    const output = await transform('panel(m4, active, ...children)')
    expect(output).toContain('_prop("margin", "4px"), _className("active"), ...children')
  })

  test("PascalCase extension calls avoid component wrapping", async () => {
    const output = await transform('Panel("hello")', [{ Panel: { type: "element", tag: "div" } }])
    expect(output).toContain('_elem("div", ["hello"])')
    expect(output).not.toContain("lazy")
  })

  test("dotted-only element roots support references, calls, and class fallback", async () => {
    const definitions: HypeupExtension[] = [{
      "widgets.card": { type: "element", tag: "div", className: "base" },
    }]
    expect(await renderExtension("widgets.card", definitions)).toBe('<div class="base"></div>')
    expect(await renderExtension('widgets.card.active("hello")', definitions)).toBe('<div class="base active">hello</div>')
    expect(await transform("widgets", definitions)).toBe("widgets;")
  })

  test("nested calls keep generated imports isolated across files", async () => {
    const plugin = hypeupBabelPlugin({ extensions })
    for (const source of ['panel(m4)', 'logo(active)']) {
      const result = await transformAsync(source, { plugins: [plugin] })
      expect(result?.code).toContain('from "@hypeup/runtime"')
    }
  })
})
