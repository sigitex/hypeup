import { describe, test, expect } from "bun:test"
import { transformAsync } from "@babel/core"
import { hypeupBabelPlugin } from "../src/hypeupBabelPlugin"

async function transform(code: string): Promise<string> {
  const result = await transformAsync(code, {
    filename: "test.js",
    plugins: [hypeupBabelPlugin],
  })
  return result?.code ?? ""
}

// HTML Element Lowering

describe("HTML element lowering", () => {
  test("standard element call", async () => {
    const result = await transform(`div("hello")`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('elem')
    expect(result).toContain('"div"')
    expect(result).toContain('"hello"')
  })

  test("void element call", async () => {
    const result = await transform(`br()`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('elemVoid')
    expect(result).toContain('"br"')
  })

  test("void element with attributes", async () => {
    const result = await transform(`img({ src: "x.png" })`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('elemVoid')
    expect(result).toContain('"img"')
  })
})

// Class Chain Lowering

describe("class chain lowering", () => {
  test("single class", async () => {
    const result = await transform(`div.active("hello")`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('className')
    expect(result).toContain('"active"')
  })

  test("multiple classes", async () => {
    const result = await transform(`div.active.large("hello")`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"active"')
    expect(result).toContain('"large"')
  })

  test("camelCase class kebabized", async () => {
    const result = await transform(`div.activeItem("hello")`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"active-item"')
  })
})

// CSS Property Lowering

describe("CSS property call-form lowering", () => {
  test("simple property call", async () => {
    const result = await transform(`color("red")`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('prop')
    expect(result).toContain('"color"')
    expect(result).toContain('"red"')
  })

  test("camelCase property call", async () => {
    const result = await transform(`zIndex(10)`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"z-index"')
  })
})

describe("CSS property keyword-access lowering", () => {
  test("keyword access", async () => {
    const result = await transform(`zIndex.auto`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"z-index"')
    expect(result).toContain('"auto"')
  })

  test("camelCase keyword", async () => {
    const result = await transform(`writingMode.horizontalTb`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"writing-mode"')
    expect(result).toContain('"horizontal-tb"')
  })

  test("color keyword access", async () => {
    const result = await transform(`color.red`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"color"')
    expect(result).toContain('"red"')
  })
})

// At-Rule Lowering

describe("at-rule lowering", () => {
  test("at-rule with rule argument", async () => {
    const result = await transform(`$media("(min-width: 600px)", div("hi"))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('atRule')
    expect(result).toContain('"@media"')
    expect(result).toContain('"(min-width: 600px)"')
  })

  test("at-rule without rule argument", async () => {
    const result = await transform(`$fontFace(fontFamily("Arial"))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"@font-face"')
    expect(result).toContain('null')
  })
})

// Rule Lowering

describe("rule lowering", () => {
  test("rule call with string selector", async () => {
    const result = await transform(`rule(".foo", color("red"))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('rule')
    expect(result).toContain('".foo"')
  })

  test("rule class access", async () => {
    const result = await transform(`rule.active(color("red"))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('".active"')
  })

  test("rule class access kebabized", async () => {
    const result = await transform(`rule.activeItem(color("red"))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('".active-item"')
  })

  test("rule with element selector", async () => {
    const result = await transform(`rule(div, color("red"))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"div"')
  })
})

// each() Lowering

describe("each lowering", () => {
  test("each call rewritten to import from runtime", async () => {
    const result = await transform(`each(state.items, i => i.id, i => li(i.name))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('@hypeup/runtime')
    expect(result).toContain('each')
  })

  test("each arguments not thunk-wrapped", async () => {
    const result = await transform(`each(state.items, i => i.id, i => li(i.name))`)
    // Arguments should be passed as-is, not wrapped in () => ...
    // The arrow functions should appear directly, not double-wrapped
    expect(result).toContain('i => i.id')
    expect(result).not.toMatch(/\(\) => i => i\.id/)
  })

  test("each with local binding not rewritten", async () => {
    const result = await transform(`const each = myFn; each(items)`)
    expect(result).toMatchSnapshot()
    // Should NOT import each — it is locally bound
    expect(result).not.toContain('@hypeup/client')
  })

  test("each inside element contents", async () => {
    const result = await transform(`ul(each(state.items, i => i.id, i => li(i.name)))`)
    expect(result).toMatchSnapshot()
    // each should be imported from runtime
    expect(result).toContain('@hypeup/runtime')
    // ul should be transformed to elem
    expect(result).toContain('elem')
    expect(result).toContain('"ul"')
  })
})

// Builtin Lowering

describe("builtin lowering", () => {
  test("doctype.html5", async () => {
    const result = await transform(`doctype.html5`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('raw')
    expect(result).toContain('"<!DOCTYPE html>"')
  })

  test("cssString passthrough", async () => {
    const result = await transform(`cssString(userInput)`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('cssString')
  })

  test("elem builtin preserves call", async () => {
    const result = await transform(`elem(tag, "hello")`)
    expect(result).toMatchSnapshot()
  })
})

// Scope Shadowing Skip

describe("scope-shadowing skip", () => {
  test("locally bound name not rewritten", async () => {
    const result = await transform(`const div = something(); div("hello")`)
    expect(result).toMatchSnapshot()
    // Should NOT contain elem — div is locally bound
    expect(result).not.toContain('elem(')
  })

  test("destructured name not rewritten", async () => {
    const result = await transform(`const { color } = palette; color("red")`)
    expect(result).toMatchSnapshot()
    expect(result).not.toContain('prop(')
  })

  test("parameter name not rewritten", async () => {
    const result = await transform(`function render(div) { return div("hi") }`)
    expect(result).toMatchSnapshot()
    expect(result).not.toContain('elem(')
  })
})

// Import Injection

describe("import injection", () => {
  test("only used helpers imported", async () => {
    const result = await transform(`div("hello"); color("red")`)
    expect(result).toMatchSnapshot()
    // Should import elem and prop but not rule, atRule, etc.
    expect(result).toContain('@hypeup/runtime')
  })

  test("multiple uses produce single import", async () => {
    const result = await transform(`div("a"); span("b"); p("c")`)
    expect(result).toMatchSnapshot()
    // All three use elem — should only have one import of elem
    const imports = result.match(/import.*from.*@hypeup\/runtime/g)
    expect(imports?.length).toBe(1)
  })

  test("collision-safe import", async () => {
    // User has local binding named 'elem', transformer also needs elem
    const result = await transform(`const elem = "mine"; div("hello")`)
    expect(result).toMatchSnapshot()
    // div should still be transformed even though elem is locally bound
    expect(result).toContain('"div"')
  })
})

// Keyword Collisions

describe("keyword collisions", () => {
  test("_var maps to var tag", async () => {
    const result = await transform(`_var("code")`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('"var"')
    expect(result).toContain('elem')
  })
})

// PascalCase Lazy Wrapping

describe("PascalCase lazy wrapping", () => {
  test("PascalCase call with args is wrapped", async () => {
    const result = await transform(`TodoRow(todo, isSelected)`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('lazy')
    expect(result).toContain('TodoRow')
    expect(result).toContain('@hypeup/runtime')
  })

  test("PascalCase call with single arg", async () => {
    const result = await transform(`Header(count)`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('lazy')
    expect(result).toContain('Header')
  })

  test("zero-arg PascalCase call is NOT wrapped", async () => {
    const result = await transform(`Header()`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('Header()')
    expect(result).not.toContain('lazy')
  })

  test("lowercase function call is NOT wrapped", async () => {
    const result = await transform(`helper(x)`)
    expect(result).not.toContain('lazy')
  })

  test("known JS built-in is NOT wrapped", async () => {
    const result = await transform(`String(value)`)
    expect(result).not.toContain('lazy')
    expect(result).toContain('String(value)')
  })

  test("Date built-in is NOT wrapped", async () => {
    const result = await transform(`Date(x)`)
    expect(result).not.toContain('lazy')
  })

  test("PascalCase call in variable assignment is wrapped", async () => {
    const result = await transform(`const row = TodoRow(todo)`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('lazy')
    expect(result).toContain('TodoRow')
  })

  test("PascalCase call inside each() mapFn is wrapped", async () => {
    const result = await transform(`each(items, d => d.id, d => TodoRow(d, selected))`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('lazy')
    expect(result).toContain('TodoRow')
  })

  test("new expression is NOT wrapped", async () => {
    const result = await transform(`new Element("div", false, [])`)
    expect(result).not.toContain('lazy')
  })

  test("locally bound PascalCase IS wrapped", async () => {
    const result = await transform(`const MyComp = () => {}; MyComp(x)`)
    expect(result).toMatchSnapshot()
    expect(result).toContain('lazy')
  })

  test("multiple PascalCase calls share single lazy import", async () => {
    const result = await transform(`TodoRow(a); AdminRow(b)`)
    expect(result).toMatchSnapshot()
    const imports = result.match(/import.*lazy.*from.*@hypeup\/runtime/g)
    expect(imports?.length).toBe(1)
  })
})
