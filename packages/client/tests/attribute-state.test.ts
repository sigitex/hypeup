import "./setup-dom"
import { describe, expect, spyOn, test } from "bun:test"
import { Attr, CssClass, Element, Property } from "@hypeup/vdom"
import { className, classifyElement } from "@hypeup/runtime"
import { render } from "@hypeup/render"
import { diffElement, mountElement } from "../src/mount"

const forms = [
  { name: "object", create: (name: string, value: unknown) => ({ [name]: value }) },
  { name: "Attr", create: (name: string, value: unknown) => new Attr(name, value) },
]

describe("attribute state parity", () => {
  for (const earlier of forms) {
    for (const later of forms) {
      test(`${earlier.name} then ${later.name}: ordinary values replace`, () => {
        for (const name of ["title", "rel", "aria-labelledby", "aria-describedby", "headers", "part", "role", "srcset"]) {
          expectParity([earlier.create(name, "first"), [later.create(name, "last")]], { [name]: "last" })
        }
        expectParity([earlier.create("style", "color: red"), later.create("style", "background: black")], { style: "background: black" })
      })

      test(`${earlier.name} then ${later.name}: controls and literal values`, () => {
        for (const name of ["title", "disabled", "data-active"]) {
          for (const value of [true, false, null, undefined, "true", "false", 0, "", 0n]) {
            const expected = value === false || value === null || value === undefined
              ? {}
              : { [name]: value === true ? "" : String(value) }
            expectParity([earlier.create(name, "first"), later.create(name, value)], expected)
          }
        }
      })
    }
  }

  test("Empty Content and absent keys do not remove attributes", () => {
    expectParity([{ title: "kept", class: "base", disabled: true }, false, null, undefined, "", {}, 0], {
      title: "kept", class: "base", disabled: "",
    }, "0")
  })

  test("all lowered class sources accumulate without normalization", () => {
    expectParity([
      className("base"),
      className("helper", "Active"),
      { class: "Active wide" },
      new Attr("class", "first\tThird"),
      { class: "" },
      new Attr("class", ""),
      new CssClass(""),
    ], { class: "base helper Active Active wide first Third" })
  })

  test("class presence, empty values, removals, and later contributions", () => {
    for (const form of forms) {
      expectParity([form.create("class", true)], { class: "" })
      expectParity([form.create("class", "")], {})
      expectParity([form.create("class", " \t\n")], {})
      expectParity([form.create("class", true), { class: "" }], { class: "" })
      expectParity([className("base"), form.create("class", true)], { class: "base" })
      expectParity([className("base"), form.create("class", "false")], { class: "base false" })
      expectParity([className("base"), form.create("class", 0)], { class: "base 0" })
      for (const removal of [false, null, undefined]) {
        expectParity([className("base"), form.create("class", removal)], {})
        expectParity([className("base"), form.create("class", removal), className("later")], { class: "later" })
      }
    }
  })

  test("attribute values stay unescaped until HTML serialization", () => {
    const value = `quotes: "' & < > &amp;`
    for (const form of forms) {
      expectParity([form.create("title", value)], { title: value })
      expectParity([form.create("class", value)], { class: value })
    }
    const node = new Element("div", false, [new Attr("title", value)])
    expect(render(node)).toContain("&amp;amp;")
    expect(node.contents[0].value).toBe(value)
    expect(classifyElement(node.contents, false).attributes.title).toBe(value)
  })

  test("generated inline styles and class helpers escape on server only", () => {
    const value = `"<&amp;>'"`
    const node = new Element("div", false, [className(value), new Property("--label", value)])
    const parsed = parseElement(render(node))
    const mounted = mountElement(node)
    expect(render(node)).toContain("&amp;amp;")
    expect(parsed.getAttribute("class")).toBe(value)
    expect(mounted.element.getAttribute("class")).toBe(value)
    expect(parsed.getAttribute("style")).toBe(`--label: ${value}`)
    expect(mounted.element.style.getPropertyValue("--label")).toBe(value)
    expect(parsed.getAttribute("style")).toBe(`--label: ${mounted.element.style.getPropertyValue("--label")}`)
    const changed = new Element("div", false, [className("changed"), new Property("--label", "before")])
    const redrawn = mountElement(changed)
    diffElement(redrawn, node)
    expect(redrawn.element.getAttribute("class")).toBe(value)
    expect(redrawn.element.style.getPropertyValue("--label")).toBe(value)
  })
})

describe("element-level redraw", () => {
  test("unchanged later contributions keep precedence without DOM writes", () => {
    const view = (value: string) => new Element("div", false, [
      new Attr("title", value), new Property("color", value),
      [{ title: "last" }, [new Property("color", "blue")]],
    ])
    const handle = mountElement(view("red"))
    const setAttribute = spyOn(handle.element, "setAttribute")
    const removeAttribute = spyOn(handle.element, "removeAttribute")
    const setProperty = spyOn(handle.element.style, "setProperty")
    const removeProperty = spyOn(handle.element.style, "removeProperty")
    diffElement(handle, view("green"))
    expect(handle.element.title).toBe("last")
    expect(handle.element.style.color).toBe("blue")
    expect(setAttribute).not.toHaveBeenCalled()
    expect(removeAttribute).not.toHaveBeenCalled()
    expect(setProperty).not.toHaveBeenCalled()
    expect(removeProperty).not.toHaveBeenCalled()
    setAttribute.mockRestore()
    removeAttribute.mockRestore()
    setProperty.mockRestore()
    removeProperty.mockRestore()
  })

  test("removing later contributions restores earlier values", () => {
    const base = [{ title: "first" }, new Property("color", "red")]
    const handle = mountElement(new Element("div", false, [base, [{ title: "last" }, new Property("color", "blue")]]))
    for (const tail of [false, null, undefined, [], {}]) {
      const node = new Element("div", false, [base, tail])
      diffElement(handle, node)
      expect(handle.element.title).toBe("first")
      expect(handle.element.style.color).toBe("red")
      expect(attributes(handle.element)).toEqual(attributes(mountElement(node).element))
      diffElement(handle, new Element("div", false, [base, [{ title: "last" }, new Property("color", "blue")]]))
    }
    diffElement(handle, new Element("div", false, [base]))
    expect(handle.element.title).toBe("first")
    expect(handle.element.style.color).toBe("red")
  })

  test("explicit removals override earlier values until removal slot disappears", () => {
    const base = { title: "first", class: "base" }
    const handle = mountElement(new Element("div", false, [base]))
    diffElement(handle, new Element("div", false, [base, { title: false, class: null }]))
    expect(attributes(handle.element)).toEqual({})
    diffElement(handle, new Element("div", false, [base, false]))
    expect(attributes(handle.element)).toEqual(base)
  })

  test("removing duplicate class contribution writes resolved class once", () => {
    const handle = mountElement(new Element("div", false, [className("active"), className("active")]))
    expect(handle.element.className).toBe("active active")
    const setAttribute = spyOn(handle.element, "setAttribute")
    diffElement(handle, new Element("div", false, [className("active"), false]))
    expect(handle.element.className).toBe("active")
    expect(setAttribute).toHaveBeenCalledTimes(1)
    expect(setAttribute).toHaveBeenCalledWith("class", "active")
    setAttribute.mockRestore()
  })

  test("class removal performs one removal and unchanged absence does nothing", () => {
    const handle = mountElement(new Element("div", false, [className("base"), { class: "extra" }]))
    const removeAttribute = spyOn(handle.element, "removeAttribute")
    const node = new Element("div", false, [className("base"), new Attr("class", false)])
    diffElement(handle, node)
    diffElement(handle, node)
    expect(removeAttribute).toHaveBeenCalledTimes(1)
    expect(removeAttribute).toHaveBeenCalledWith("class")
    removeAttribute.mockRestore()
  })

  test("equivalent resolved state suppresses all shared-field DOM writes", () => {
    const handle = mountElement(new Element("div", false, [{ title: true, class: "base" }, new Property("color", "red")]))
    const setAttribute = spyOn(handle.element, "setAttribute")
    const removeAttribute = spyOn(handle.element, "removeAttribute")
    const setProperty = spyOn(handle.element.style, "setProperty")
    diffElement(handle, new Element("div", false, [new Attr("title", ""), [className("base"), new Property("color", "red")]]))
    expect(setAttribute).not.toHaveBeenCalled()
    expect(removeAttribute).not.toHaveBeenCalled()
    expect(setProperty).not.toHaveBeenCalled()
    setAttribute.mockRestore()
    removeAttribute.mockRestore()
    setProperty.mockRestore()
  })

  test("function contributions resolve once during current traversal", () => {
    let calls = 0
    let value = "first"
    const view = () => new Element("div", false, [() => {
      calls += 1
      return [{ title: value }, className("base")]
    }, new Attr("title", "last")])
    const handle = mountElement(view())
    value = "changed"
    diffElement(handle, view())
    expect(calls).toBe(2)
    expect(handle.element.title).toBe("last")
    expect(handle.element.className).toBe("base")
  })

  test("removing all CSS properties matches fresh empty mount", () => {
    const handle = mountElement(new Element("div", false, [new Property("color", "red")]))
    const node = new Element("div", false, [])
    diffElement(handle, node)
    expect(attributes(handle.element)).toEqual(attributes(mountElement(node).element))
  })

  test("shared fields remain local to each element", () => {
    const child = new Element("span", false, [{ title: "child", class: "child" }])
    const handle = mountElement(new Element("div", false, [{ title: "parent", class: "parent" }, child]))
    diffElement(handle, new Element("div", false, [{ title: false, class: false }, child]))
    expect(attributes(handle.element)).toEqual({})
    expect(attributes(handle.element.firstElementChild!)).toEqual({ title: "child", class: "child" })
  })
})

function expectParity(contents: unknown[], expected: Record<string, string>, text = ""): void {
  const node = new Element("div", false, contents)
  const parsed = parseElement(render(node))
  const mounted = mountElement(node)
  const redrawn = mountElement(new Element("div", false, [{ title: "old", class: "old", "data-stale": "old" }]))
  diffElement(redrawn, node)
  for (const element of [parsed, mounted.element, redrawn.element]) {
    expect(attributes(element)).toEqual(expected)
    expect(element.textContent).toBe(text)
  }
}

function parseElement(html: string): HTMLElement {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild as HTMLElement
}

function attributes(element: globalThis.Element): Record<string, string> {
  return Object.fromEntries(Array.from(element.attributes, attribute => [attribute.name, attribute.value]))
}
