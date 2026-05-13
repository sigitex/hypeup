import { describe, expect, test } from "bun:test"
import {
  Attr,
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
