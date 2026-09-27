import { describe, expect, test } from "bun:test"
import {
  Attr,
  AtRule,
  CssClass,
  Element,
  Property,
  Raw,
  Rule,
} from "@hypeup/vdom"
import { classifyElement, classifyRule, classifyAtRule } from "../src/classify"

describe("classifyElement", () => {
  test("Property routes to properties slot", () => {
    const result = classifyElement([new Property("color", "red")], false)
    expect(result.properties["color"]).toBe("red")
  })

  test("Attr routes to attributes slot", () => {
    const result = classifyElement([new Attr("href", "/home")], false)
    expect(result.attributes["href"]).toBe("/home")
  })

  test("true Attr routes to presence attribute", () => {
    const result = classifyElement([new Attr("disabled", true)], false)
    expect(result.attributes["disabled"]).toBe(true)
  })

  test("CssClass routes to classes slot", () => {
    const result = classifyElement([new CssClass("active")], false)
    expect(result.classes).toContain("active")
  })

  test("Element child routes to children slot", () => {
    const child = new Element("span", false, ["hi"])
    const result = classifyElement([child], false)
    expect(result.children).toContain(child)
  })

  test("Raw routes to children slot", () => {
    const r = new Raw("<!-- -->")
    const result = classifyElement([r], false)
    expect(result.children).toContain(r)
  })

  test("string routes to children slot", () => {
    const result = classifyElement(["hello"], false)
    expect(result.children).toContain("hello")
  })

  test("plain object routes to attributes", () => {
    const result = classifyElement([{ id: "main", "data-x": "1" }], false)
    expect(result.attributes["id"]).toBe("main")
    expect(result.attributes["data-x"]).toBe("1")
  })

  test("true object attribute routes to presence attribute", () => {
    const result = classifyElement([{ disabled: true }], false)
    expect(result.attributes["disabled"]).toBe(true)
  })

  test("false object attribute removes attribute", () => {
    const result = classifyElement([{ disabled: false }], false)
    expect(result.attributes).not.toHaveProperty("disabled")
  })

  test("textual false object attribute routes to attributes", () => {
    const result = classifyElement([{ contenteditable: "false" }], false)
    expect(result.attributes["contenteditable"]).toBe("false")
  })

  test("object with class key splits into classes", () => {
    const result = classifyElement([{ class: "foo bar" }], false)
    expect(result.classes).toContain("foo")
    expect(result.classes).toContain("bar")
  })

  test("duplicate class values concatenate", () => {
    const result = classifyElement([{ class: "a" }, { class: "b" }], false)
    expect(result.classes).toContain("a")
    expect(result.classes).toContain("b")
  })

  test("array contents are flattened", () => {
    const result = classifyElement(
      [[new Property("color", "red"), "text"]],
      false,
    )
    expect(result.properties["color"]).toBe("red")
    expect(result.children).toContain("text")
  })

  test("empty values are skipped", () => {
    const result = classifyElement([undefined, null, "", false], false)
    expect(result.children).toHaveLength(0)
    expect(Object.keys(result.attributes)).toHaveLength(0)
    expect(Object.keys(result.properties)).toHaveLength(0)
    expect(result.classes).toHaveLength(0)
  })

  test("void element suppresses children", () => {
    const result = classifyElement(
      [new Property("color", "red"), "child text"],
      true,
    )
    expect(result.properties["color"]).toBe("red")
    expect(result.children).toHaveLength(0)
  })

  test("ordinary attributes replace across forms and nested arrays", () => {
    for (const name of ["title", "rel", "aria-labelledby", "aria-describedby", "headers", "part", "role", "style", "srcset"]) {
      expect(classifyElement([{ [name]: "first" }, [new Attr(name, "last")]], false).attributes[name]).toBe("last")
      expect(classifyElement([new Attr(name, "first"), [{ [name]: "last" }]], false).attributes[name]).toBe("last")
    }
  })

  test("attribute values retain explicit controls and literals", () => {
    for (const value of [true, false, null, undefined, "true", "false", 0, "", 0n]) {
      for (const contribution of [{ title: value }, new Attr("title", value)]) {
        const result = classifyElement([{ title: "earlier" }, contribution], false)
        if (value === false || value === null || value === undefined) {
          expect(result.attributes).not.toHaveProperty("title")
        } else {
          expect(result.attributes.title).toBe(value === true ? true : String(value))
        }
      }
    }
  })

  test("Empty Content and absent keys preserve attributes and numeric zero", () => {
    const result = classifyElement([{ title: "kept", class: "base" }, false, null, undefined, "", {}, 0], false)
    expect(result.attributes).toEqual({ title: "kept", class: "base" })
    expect(result.children).toEqual(["0"])
  })

  test("mixed class sources preserve ordered duplicate tokens and spelling", () => {
    const result = classifyElement([
      [new CssClass("base"), new CssClass("Active")],
      { class: "Active wide" },
      new Attr("class", "first\tThird"),
      { class: "" },
      new Attr("class", ""),
    ], false)
    expect(result.classes).toEqual(["base", "Active", "Active", "wide", "first", "Third"])
    expect(result.attributes.class).toBe("base Active Active wide first Third")
  })

  test("class controls retain presence or clear tokens across forms", () => {
    for (const value of [false, null, undefined]) {
      for (const contribution of [{ class: value }, new Attr("class", value)]) {
        const cleared = classifyElement([new CssClass("base"), contribution], false)
        expect(cleared.classes).toEqual([])
        expect(cleared.attributes).not.toHaveProperty("class")
        const restored = classifyElement([new CssClass("base"), contribution, new CssClass("later")], false)
        expect(restored.classes).toEqual(["later"])
        expect(restored.attributes.class).toBe("later")
      }
    }
    expect(classifyElement([{ class: true }, { class: "" }], false).attributes.class).toBe(true)
    expect(classifyElement([new CssClass("base"), { class: true }], false).attributes.class).toBe("base")
    expect(classifyElement([{ class: "" }], false).attributes).not.toHaveProperty("class")
  })
})

describe("classifyRule", () => {
  test("Property routes to properties slot", () => {
    const result = classifyRule([new Property("color", "red")])
    expect(result.properties["color"]).toBe("red")
  })

  test("nested Rule routes to rules slot", () => {
    const nested = new Rule(".bar", [new Property("font-size", "12px")])
    const result = classifyRule([nested])
    expect(result.rules).toContain(nested)
  })

  test("array contents are flattened", () => {
    const result = classifyRule([
      [new Property("a", "1"), new Property("b", "2")],
    ])
    expect(result.properties["a"]).toBe("1")
    expect(result.properties["b"]).toBe("2")
  })

  test("empty values are skipped", () => {
    const result = classifyRule([undefined, null, false])
    expect(Object.keys(result.properties)).toHaveLength(0)
    expect(result.rules).toHaveLength(0)
  })

  test("CssClass is silently ignored", () => {
    const result = classifyRule([new CssClass("active") as any])
    expect(result.rules).toHaveLength(0)
    expect(Object.keys(result.properties)).toHaveLength(0)
  })

  test("Raw routes to children slot", () => {
    const r = new Raw("/* comment */")
    const result = classifyRule([r])
    expect(result.children).toContain(r)
  })

  test("AtRule routes to atRules slot", () => {
    const ar = new AtRule("media", "(min-width: 600px)", [
      new Property("padding", "20px"),
    ])
    const result = classifyRule([ar])
    expect(result.atRules).toContain(ar)
  })

  test("mixed Properties, Rules, and AtRules are sorted correctly", () => {
    const prop = new Property("color", "red")
    const nested = new Rule(".bar", [new Property("font-size", "12px")])
    const ar = new AtRule("media", "(min-width: 600px)", [
      new Property("padding", "20px"),
    ])
    const result = classifyRule([prop, nested, ar])
    expect(result.properties["color"]).toBe("red")
    expect(result.rules).toContain(nested)
    expect(result.atRules).toContain(ar)
  })

  test("AtRule nested in array is collected", () => {
    const ar = new AtRule("supports", "(display: grid)", [
      new Property("display", "grid"),
    ])
    const result = classifyRule([[ar]])
    expect(result.atRules).toContain(ar)
  })

  test("atRules array is empty when no AtRule present", () => {
    const result = classifyRule([new Property("color", "red")])
    expect(result.atRules).toHaveLength(0)
  })
})

describe("classifyAtRule", () => {
  test("Property routes to properties slot", () => {
    const result = classifyAtRule([new Property("font-family", "Arial")])
    expect(result.properties["font-family"]).toBe("Arial")
  })

  test("Rule routes to children slot", () => {
    const r = new Rule(".foo", [new Property("color", "red")])
    const result = classifyAtRule([r])
    expect(result.children).toContain(r)
  })

  test("array contents are flattened", () => {
    const r = new Rule(".b", [])
    const result = classifyAtRule([[new Property("a", "1"), r]])
    expect(result.properties["a"]).toBe("1")
    expect(result.children).toContain(r)
  })

  test("CssClass is silently ignored", () => {
    const result = classifyAtRule([new CssClass("active") as any])
    expect(result.children).toHaveLength(0)
    expect(Object.keys(result.properties)).toHaveLength(0)
  })

  test("Raw routes to children slot", () => {
    const r = new Raw("/* raw css */")
    const result = classifyAtRule([r])
    expect(result.children).toContain(r)
  })
})
