import { describe, expect, test } from "bun:test"
import {
  Attr,
  AtRule,
  CssClass,
  Element,
  EventBinding,
  Property,
  Raw,
  Rule,
} from "../src"

describe("Element", () => {
  test("stores tag, isVoid, and raw contents", () => {
    const p = new Property("color", "red")
    const el = new Element("div", false, [p, "hello", { id: "main" }])
    expect(el.tag).toBe("div")
    expect(el.isVoid).toBe(false)
    expect(el.contents).toEqual([p, "hello", { id: "main" }])
  })

  test("void element stores contents without filtering", () => {
    const el = new Element("br", true, ["child text"])
    expect(el.isVoid).toBe(true)
    expect(el.contents).toEqual(["child text"])
  })
})

describe("Rule", () => {
  test("stores selector and raw contents", () => {
    const p = new Property("color", "red")
    const nested = new Rule(".bar", [new Property("font-size", "12px")])
    const r = new Rule(".foo", [p, nested])
    expect(r.selector).toBe(".foo")
    expect(r.contents).toEqual([p, nested])
  })
})

describe("AtRule", () => {
  test("stores keyword, rule, and raw contents", () => {
    const nested = new Rule(".foo", [new Property("color", "red")])
    const ar = new AtRule("media", "(min-width: 600px)", [nested])
    expect(ar.keyword).toBe("media")
    expect(ar.rule).toBe("(min-width: 600px)")
    expect(ar.contents).toEqual([nested])
  })

  test("accepts null rule", () => {
    const ar = new AtRule("font-face", null, [])
    expect(ar.rule).toBeNull()
  })
})

describe("CssClass", () => {
  test("stores name", () => {
    const c = new CssClass("active")
    expect(c.name).toBe("active")
  })
})

describe("Attr", () => {
  test("stores name and value", () => {
    const a = new Attr("href", "/home")
    expect(a.name).toBe("href")
    expect(a.value).toBe("/home")
  })
})

describe("Property", () => {
  test("stores name and value", () => {
    const p = new Property("color", "red")
    expect(p.name).toBe("color")
    expect(p.value).toBe("red")
  })
})

describe("EventBinding", () => {
  test("stores event and handler", () => {
    const handler = () => {}
    const eb = new EventBinding("click", handler)
    expect(eb.event).toBe("click")
    expect(eb.handler).toBe(handler)
  })
})

describe("Raw", () => {
  test("stores text from string", () => {
    const r = new Raw("<!-- comment -->")
    expect(r.text).toBe("<!-- comment -->")
  })

  test("coerces null to empty string", () => {
    const r = new Raw(null)
    expect(r.text).toBe("")
  })

  test("coerces undefined to empty string", () => {
    const r = new Raw(undefined)
    expect(r.text).toBe("")
  })
})
