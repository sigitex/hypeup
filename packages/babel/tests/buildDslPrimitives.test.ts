import { describe, expect, test } from "bun:test"
import { buildDslPrimitives, type HypeupExtension, type ExtensionSymbol } from "../src"

describe("extension primitive table", () => {
  test("registers constants, dotted entries, and inferred void elements", () => {
    const extension: HypeupExtension = {
      m4: { type: "prop", css: "margin", value: "4px" },
      "m4.x": { type: "prop", css: "margin-inline", value: "4px" },
      active: { type: "className", value: "active" },
      panel: { type: "element", tag: "div", className: "container", props: { display: "flex" }, attrs: { role: "region" } },
      logo: { type: "element", tag: "img", attrs: { src: "/logo.png" } },
    }
    const table = buildDslPrimitives([extension])
    expect(table.get("m4")).toEqual({ kind: "prop-constant", css: "margin", value: "4px" })
    expect(table.get("m4.x")).toEqual({ kind: "prop-constant", css: "margin-inline", value: "4px" })
    expect(table.get("active")).toEqual({ kind: "className-constant", value: "active" })
    expect(table.get("panel")).toMatchObject({ kind: "element-constant", tag: "div", isVoid: false, className: "container", props: { display: "flex" }, attrs: { role: "region" } })
    expect(table.get("logo")).toMatchObject({ kind: "element-constant", tag: "img", isVoid: true })
  })

  test("aliases reuse built-in entries", () => {
    const table = buildDslPrimitives([{
      fs: { type: "alias", target: "fontSize" },
      cc: { type: "alias", target: "className" },
      divAlias: { type: "alias", target: "div" },
    }])
    expect(table.get("fs")).toBe(table.get("fontSize"))
    expect(table.get("cc")).toBe(table.get("className"))
    expect(table.get("divAlias")).toBe(table.get("div"))
  })

  test("resolves forward and multihop aliases in any definition order", () => {
    const entries: [string, ExtensionSymbol][] = [
      ["spacing", { type: "alias", target: "compact" }],
      ["compact", { type: "alias", target: "tokens.small" }],
      ["tokens.small", { type: "prop", css: "margin", value: "4px" }],
    ]
    for (const ordered of [entries, entries.toReversed(), [entries[1], entries[0], entries[2]]]) {
      for (const extensions of [[Object.fromEntries(ordered)], ordered.map(([name, symbol]) => ({ [name]: symbol }))]) {
        const table = buildDslPrimitives(extensions)
        expect(table.get("spacing")).toBe(table.get("tokens.small"))
        expect(table.get("compact")).toBe(table.get("tokens.small"))
        expect(table.get("spacing")).toEqual({ kind: "prop-constant", css: "margin", value: "4px" })
      }
    }
  })

  test("aliases do not copy dotted descendants", () => {
    const table = buildDslPrimitives([{
      panel: { type: "element", tag: "div" },
      "panel.sm": { type: "element", tag: "section" },
      box: { type: "alias", target: "panel" },
    }])
    expect(table.get("box")).toBe(table.get("panel"))
    expect(table.has("box.sm")).toBe(false)
  })

  test("rejects missing targets", () => {
    expect(() => buildDslPrimitives([{ fs: { type: "alias", target: "notDefined" } }])).toThrow('Missing extension alias target "notDefined"')
  })

  test("rejects direct and indirect cycles regardless of order", () => {
    expect(() => buildDslPrimitives([{ box: { type: "alias", target: "box" } }])).toThrow("alias cycle")
    const aliases: HypeupExtension[] = [
      { box: { type: "alias", target: "panel" } },
      { panel: { type: "alias", target: "box" } },
    ]
    expect(() => buildDslPrimitives(aliases)).toThrow("alias cycle")
    expect(() => buildDslPrimitives(aliases.toReversed())).toThrow("alias cycle")
  })

  test("reserves every built-in root, including unused dotted paths", () => {
    for (const name of buildDslPrimitives().keys()) {
      for (const key of [name, `${name}.unused.path`]) {
        expect(() => buildDslPrimitives([{ [key]: { type: "className", value: "custom" } }])).toThrow("reserved built-in root")
      }
    }
    for (const key of ["div.card", "display.flex", "container.sm"]) {
      expect(() => buildDslPrimitives([{ [key]: { type: "element", tag: "div" } }])).toThrow("reserved built-in root")
    }
  })

  test("checks collisions before resolving aliases", () => {
    expect(() => buildDslPrimitives([
      { box: { type: "alias", target: "missing" } },
      { "div.card": { type: "className", value: "card" } },
    ])).toThrow("reserved built-in root")
    expect(() => buildDslPrimitives([
      { box: { type: "alias", target: "missing" } },
      { box: { type: "className", value: "card" } },
    ])).toThrow('Duplicate extension symbol "box"')
  })

  test("rejects duplicate full keys across extensions", () => {
    for (const key of ["fs", "tokens.small"]) {
      const extension: HypeupExtension = { [key]: { type: "className", value: "custom" } }
      expect(() => buildDslPrimitives([extension, extension])).toThrow("Duplicate extension symbol")
    }
  })

  test("aggregates independently registered root and dotted entries", () => {
    const table = buildDslPrimitives([
      { "panel.sm": { type: "element", tag: "section" } },
      { panel: { type: "element", tag: "div" } },
    ])
    expect(table.get("panel")).toMatchObject({ tag: "div" })
    expect(table.get("panel.sm")).toMatchObject({ tag: "section" })
  })
})
