import { describe, expect, test } from "bun:test"
import {
  Attr,
  AtRule,
  CssClass,
  Each,
  Element,
  Property,
  Raw,
  Rule,
} from "@hypeup/vdom"
import { render } from "../src/render"

describe("render elements", () => {
  test("div with attributes, properties, classes, and children", () => {
    const el = new Element("div", false, [
      new CssClass("active"),
      new Property("color", "red"),
      { id: "main" },
      "hello",
    ])
    expect(render(el)).toBe(
      '<div id="main" class="active" style="color: red">hello</div>',
    )
  })

  test("void element renders without closing tag", () => {
    const el = new Element("br", true, [])
    expect(render(el)).toBe("<br>")
  })

  test("void element with properties renders correctly", () => {
    const el = new Element("img", true, [{ src: "a.png", alt: "pic" }])
    expect(render(el)).toBe('<img src="a.png" alt="pic">')
  })

  test("element with Attr node", () => {
    const el = new Element("a", false, [new Attr("href", "/home"), "link"])
    expect(render(el)).toBe('<a href="/home">link</a>')
  })

  test("element with CssClass node", () => {
    const el = new Element("div", false, [
      new CssClass("foo"),
      new CssClass("bar"),
    ])
    expect(render(el)).toBe('<div class="foo bar"></div>')
  })

  test("element with nested children", () => {
    const el = new Element("div", false, [
      new Element("span", false, ["inner"]),
    ])
    expect(render(el)).toBe("<div><span>inner</span></div>")
  })
})

describe("render Raw", () => {
  test("Raw passthrough", () => {
    const r = new Raw("<!-- comment -->")
    expect(render(r)).toBe("<!-- comment -->")
  })
})

describe("render rules", () => {
  test("basic rule", () => {
    const r = new Rule(".foo", [new Property("color", "red")])
    expect(render(r)).toBe(".foo{color:red}")
  })

  test("nested rule", () => {
    const r = new Rule(".foo", [
      new Property("color", "red"),
      new Rule(".bar", [new Property("font-size", "12px")]),
    ])
    expect(render(r)).toBe(".foo{color:red}.foo .bar{font-size:12px}")
  })

  test("rule with multiple properties", () => {
    const r = new Rule(".x", [new Property("a", "1"), new Property("b", "2")])
    expect(render(r)).toBe(".x{a:1;b:2}")
  })

  test("rule with Raw child emits text inline", () => {
    const r = new Rule(".foo", [
      new Property("color", "red"),
      new Raw("/* comment */"),
    ])
    expect(render(r)).toBe(".foo{color:red;/* comment */}")
  })

  test("rule with only Raw children", () => {
    const r = new Rule(".foo", [new Raw("color: red; font-size: 12px")])
    expect(render(r)).toBe(".foo{color: red; font-size: 12px}")
  })

  test("rule with properties, Raw, and nested rules together", () => {
    const r = new Rule(".foo", [
      new Property("color", "red"),
      new Raw("/* hack */"),
      new Rule(".bar", [new Property("font-size", "12px")]),
    ])
    expect(render(r)).toBe(".foo{color:red;/* hack */}.foo .bar{font-size:12px}")
  })
})

describe("render at-rules", () => {
  test("at-rule with nested rule", () => {
    const ar = new AtRule("media", "(min-width: 600px)", [
      new Rule(".foo", [new Property("color", "red")]),
    ])
    expect(render(ar)).toBe("@media (min-width: 600px){.foo{color:red}}")
  })

  test("at-rule with properties (e.g. font-face)", () => {
    const ar = new AtRule("font-face", null, [
      new Property("font-family", "Arial"),
    ])
    expect(render(ar)).toBe("@font-face{font-family:Arial}")
  })

  test("empty at-rule renders semicolon", () => {
    const ar = new AtRule("charset", '"utf-8"', [])
    expect(render(ar)).toBe('@charset "utf-8";')
  })

  test("at-rule with Raw child", () => {
    const ar = new AtRule("font-face", null, [
      new Property("font-family", "Arial"),
      new Raw("src: url('font.woff2')"),
    ])
    expect(render(ar)).toBe("font-face{font-family:Arialsrc: url('font.woff2')}")
  })
})

describe("render edge cases", () => {
  test("escapes HTML in text", () => {
    const el = new Element("div", false, ["<script>"])
    expect(render(el)).toBe("<div>&lt;script&gt;</div>")
  })

  test("renders arrays", () => {
    expect(render(["a", "b"])).toBe("ab")
  })

  test("skips empty values", () => {
    expect(render(undefined)).toBe("")
    expect(render(null)).toBe("")
    expect(render("")).toBe("")
    expect(render(false)).toBe("")
  })
})

describe("render Each nodes", () => {
  test("Each node rendered to HTML", () => {
    const items = [{ id: 1, name: "a" }, { id: 2, name: "b" }]
    const eachNode = new Each(
      items,
      (i: any) => i.id,
      (i: any) => new Element("li", false, [i.name]),
    )
    const ul = new Element("ul", false, [eachNode])
    expect(render(ul)).toBe("<ul><li>a</li><li>b</li></ul>")
  })

  test("empty Each node", () => {
    const eachNode = new Each(
      [],
      (i: any) => i.id,
      (i: any) => new Element("li", false, [i.name]),
    )
    const ul = new Element("ul", false, [eachNode])
    expect(render(ul)).toBe("<ul></ul>")
  })

  test("Each node with two-argument overload (index key)", () => {
    const items = ["a", "b", "c"]
    const eachNode = new Each(
      items,
      (_: any, index: number) => index,
      (i: any) => new Element("li", false, [i]),
    )
    const ul = new Element("ul", false, [eachNode])
    expect(render(ul)).toBe("<ul><li>a</li><li>b</li><li>c</li></ul>")
  })

  test("Each node among other children", () => {
    const items = [{ id: 1, text: "hello" }, { id: 2, text: "world" }]
    const eachNode = new Each(
      items,
      (i: any) => i.id,
      (i: any) => new Element("p", false, [i.text]),
    )
    const el = new Element("div", false, [
      new Element("h1", false, ["Title"]),
      eachNode,
    ])
    expect(render(el)).toBe("<div><h1>Title</h1><p>hello</p><p>world</p></div>")
  })
})
