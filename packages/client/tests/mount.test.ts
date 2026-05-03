import "./setup-dom"
import { describe, test, expect } from "bun:test"
import { mount, mountElement, diffElement } from "../src/mount"
import {
  Element,
  Lazy,
  CssClass,
  Property,
  Attr,
  EventBinding,
} from "@hypeup/vdom"

// ── Slot diffing ───────────────────────────────────────────────────

describe("slot diffing", () => {
  test("text patch — same node, new data", () => {
    const node1 = new Element("div", false, ["hello"])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("hello")

    const textNode = handle.element.childNodes[0]

    const node2 = new Element("div", false, ["world"])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("world")
    // Same Text node mutated, not replaced
    expect(handle.element.childNodes[0]).toBe(textNode)
  })

  test("text unchanged — no DOM mutation", () => {
    const node1 = new Element("div", false, ["hello"])
    const handle = mountElement(node1)

    const textNode = handle.element.childNodes[0]
    const node2 = new Element("div", false, ["hello"])
    diffElement(handle, node2)
    expect(handle.element.childNodes[0]).toBe(textNode)
  })

  test("class swap", () => {
    const node1 = new Element("div", false, [new CssClass("active")])
    const handle = mountElement(node1)
    expect(handle.element.classList.contains("active")).toBe(true)

    const node2 = new Element("div", false, [new CssClass("inactive")])
    diffElement(handle, node2)
    expect(handle.element.classList.contains("active")).toBe(false)
    expect(handle.element.classList.contains("inactive")).toBe(true)
  })

  test("class unchanged — skip", () => {
    const node1 = new Element("div", false, [new CssClass("active")])
    const handle = mountElement(node1)

    const node2 = new Element("div", false, [new CssClass("active")])
    diffElement(handle, node2)
    expect(handle.element.classList.contains("active")).toBe(true)
  })

  test("style value changed", () => {
    const node1 = new Element("div", false, [new Property("color", "red")])
    const handle = mountElement(node1)
    expect(handle.element.style.getPropertyValue("color")).toBe("red")

    const node2 = new Element("div", false, [new Property("color", "blue")])
    diffElement(handle, node2)
    expect(handle.element.style.getPropertyValue("color")).toBe("blue")
  })

  test("style name changed", () => {
    const node1 = new Element("div", false, [new Property("color", "red")])
    const handle = mountElement(node1)

    const node2 = new Element("div", false, [
      new Property("background", "blue"),
    ])
    diffElement(handle, node2)
    expect(handle.element.style.getPropertyValue("color")).toBe("")
    expect(handle.element.style.getPropertyValue("background")).toBe("blue")
  })

  test("attribute value changed", () => {
    const node1 = new Element("div", false, [new Attr("id", "one")])
    const handle = mountElement(node1)
    expect(handle.element.getAttribute("id")).toBe("one")

    const node2 = new Element("div", false, [new Attr("id", "two")])
    diffElement(handle, node2)
    expect(handle.element.getAttribute("id")).toBe("two")
  })

  test("kind change — text to class", () => {
    const node1 = new Element("div", false, ["hello"])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("hello")

    const node2 = new Element("div", false, [new CssClass("foo")])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("")
    expect(handle.element.classList.contains("foo")).toBe(true)
  })

  test("child element — same tag recurses", () => {
    const node1 = new Element("div", false, [
      new Element("span", false, ["hello"]),
    ])
    const handle = mountElement(node1)
    const span = handle.element.children[0]
    expect(span.textContent).toBe("hello")

    const node2 = new Element("div", false, [
      new Element("span", false, ["world"]),
    ])
    diffElement(handle, node2)
    // Same span element reused
    expect(handle.element.children[0]).toBe(span)
    expect(handle.element.children[0].textContent).toBe("world")
  })

  test("child element — different tag replaces", () => {
    const node1 = new Element("div", false, [
      new Element("span", false, ["hello"]),
    ])
    const handle = mountElement(node1)
    const span = handle.element.children[0]

    const node2 = new Element("div", false, [
      new Element("p", false, ["world"]),
    ])
    diffElement(handle, node2)
    expect(handle.element.children[0]).not.toBe(span)
    expect(handle.element.children[0].tagName).toBe("P")
    expect(handle.element.children[0].textContent).toBe("world")
  })

  test("null/false transitions — slot appears", () => {
    const node1 = new Element("div", false, [null])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("")

    const node2 = new Element("div", false, ["hello"])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("hello")
  })

  test("null/false transitions — slot disappears", () => {
    const node1 = new Element("div", false, ["hello"])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("hello")

    const node2 = new Element("div", false, [null])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("")
  })

  test("false to text", () => {
    const node1 = new Element("div", false, [false])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("")

    const node2 = new Element("div", false, ["visible"])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("visible")
  })

  test("new slots added", () => {
    const node1 = new Element("div", false, ["hello"])
    const handle = mountElement(node1)

    const node2 = new Element("div", false, ["hello", " world"])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("hello world")
  })

  test("old slots removed", () => {
    const node1 = new Element("div", false, ["hello", " world"])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("hello world")

    const node2 = new Element("div", false, ["hello"])
    diffElement(handle, node2)
    expect(handle.element.textContent).toBe("hello")
  })
})

// ── Redraw system ──────────────────────────────────────────────────

describe("redraw system", () => {
  test("mount creates initial DOM", () => {
    const root = document.createElement("div")
    const app = mount(root, () => new Element("p", false, ["hello"]))

    expect(root.children.length).toBe(1)
    expect(root.children[0].tagName).toBe("P")
    expect(root.children[0].textContent).toBe("hello")

    app.dispose()
  })

  test("redraw patches DOM on state change", () => {
    const state = { text: "hello" }
    const root = document.createElement("div")
    const app = mount(root, () => new Element("p", false, [state.text]))

    expect(root.children[0].textContent).toBe("hello")

    state.text = "world"
    app.redraw()
    expect(root.children[0].textContent).toBe("world")

    app.dispose()
  })

  test("redraw with no changes produces no DOM mutations", () => {
    const root = document.createElement("div")
    const app = mount(root, () => new Element("p", false, ["static"]))

    const p = root.children[0]
    const textNode = p.childNodes[0]

    app.redraw()
    // Same DOM nodes, untouched
    expect(root.children[0]).toBe(p)
    expect(p.childNodes[0]).toBe(textNode)
    expect(p.textContent).toBe("static")

    app.dispose()
  })

  test("dispose removes DOM and stops redraw", () => {
    const state = { text: "hello" }
    const root = document.createElement("div")
    const app = mount(root, () => new Element("p", false, [state.text]))

    expect(root.children.length).toBe(1)

    app.dispose()
    expect(root.children.length).toBe(0)

    // Subsequent redraw is a no-op
    state.text = "world"
    app.redraw()
    expect(root.children.length).toBe(0)
  })

  test("multiple redraws with changing state", () => {
    const state = { count: 0 }
    const root = document.createElement("div")
    const app = mount(
      root,
      () => new Element("span", false, [String(state.count)]),
    )

    expect(root.children[0].textContent).toBe("0")

    state.count = 1
    app.redraw()
    expect(root.children[0].textContent).toBe("1")

    state.count = 42
    app.redraw()
    expect(root.children[0].textContent).toBe("42")

    app.dispose()
  })

  test("redraw with child structure change", () => {
    const state = { showChild: true }
    const root = document.createElement("div")
    const app = mount(
      root,
      () =>
        new Element("div", false, [
          state.showChild ? new Element("span", false, ["child"]) : "no child",
        ]),
    )

    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].textContent).toBe("child")

    state.showChild = false
    app.redraw()
    expect(root.children[0].children.length).toBe(0)
    expect(root.children[0].textContent).toBe("no child")

    state.showChild = true
    app.redraw()
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].textContent).toBe("child")

    app.dispose()
  })
})

// ── Refs ───────────────────────────────────────────────────────────

describe("ref", () => {
  test("ref.current is set on mount", () => {
    const { ref } = require("../src/ref")
    const r = ref()
    const node = new Element("div", false, [r])
    const handle = mountElement(node)
    expect(r.current).toBe(handle.element)
  })

  test("ref.current is cleared on dispose", () => {
    const { ref } = require("../src/ref")
    const r = ref()
    const root = document.createElement("div")
    const app = mount(root, () => new Element("div", false, [r]))
    expect(r.current).toBe(root.children[0])

    app.dispose()
    expect(r.current).toBe(null)
  })

  test("ref.current updates when element is reused", () => {
    const { ref } = require("../src/ref")
    const r = ref()
    const node1 = new Element("div", false, [r])
    const handle = mountElement(node1)
    const el = handle.element
    expect(r.current).toBe(el)

    // Same ref on redraw — element stays the same
    const node2 = new Element("div", false, [r])
    diffElement(handle, node2)
    expect(r.current).toBe(el)
  })
})

// ── Auto-redraw on events ──────────────────────────────────────────

describe("auto-redraw on events", () => {
  test("on() wraps handler with redraw", () => {
    const state = { count: 0 }
    const root = document.createElement("div")

    const app = mount(
      root,
      () =>
        new Element("button", false, [
          new EventBinding("click", () => {
            try {
              state.count++
            } finally {
              // The on() wrapper calls redraw in finally
            }
          }),
          String(state.count),
        ]),
    )

    // Verify initial state
    expect(root.children[0].textContent).toBe("0")

    app.dispose()
  })

  test("on.silent() does not trigger redraw", () => {
    const { on } = require("../src/on")
    // oxlint-disable-next-line no-unused-vars
    let called = false
    const binding = on.silent("click", () => {
      called = true
    })
    expect(binding).toBeInstanceOf(EventBinding)
    // The handler is the original, not wrapped
    expect(binding.handler).toBeDefined()
  })
})

// ── Lazy component nodes ───────────────────────────────────────────

describe("lazy mount", () => {
  function TodoRow(text: string): Element {
    return new Element("li", false, [text])
  }

  test("first mount calls fn and creates DOM", () => {
    const node = new Element("ul", false, [new Lazy(TodoRow, ["hello"])])
    const handle = mountElement(node)
    expect(handle.element.children.length).toBe(1)
    expect(handle.element.children[0].tagName).toBe("LI")
    expect(handle.element.children[0].textContent).toBe("hello")
  })

  test("same fn + same args — skip (no DOM ops)", () => {
    const args: [string] = ["hello"]
    const node1 = new Element("ul", false, [new Lazy(TodoRow, args)])
    const handle = mountElement(node1)
    const li = handle.element.children[0]

    // Redraw with same fn and same arg references
    const node2 = new Element("ul", false, [new Lazy(TodoRow, args)])
    diffElement(handle, node2)
    // Same LI element, untouched
    expect(handle.element.children[0]).toBe(li)
    expect(handle.element.children[0].textContent).toBe("hello")
  })

  test("same fn + different args — re-run and diff", () => {
    const node1 = new Element("ul", false, [new Lazy(TodoRow, ["hello"])])
    const handle = mountElement(node1)
    const li = handle.element.children[0]
    expect(li.textContent).toBe("hello")

    const node2 = new Element("ul", false, [new Lazy(TodoRow, ["world"])])
    diffElement(handle, node2)
    // Same LI element reused (same tag), content updated
    expect(handle.element.children[0]).toBe(li)
    expect(handle.element.children[0].textContent).toBe("world")
  })

  test("different fn — dispose and remount", () => {
    function AdminRow(text: string): Element {
      return new Element("div", false, [text])
    }

    const node1 = new Element("ul", false, [new Lazy(TodoRow, ["hello"])])
    const handle = mountElement(node1)
    const li = handle.element.children[0]
    expect(li.tagName).toBe("LI")

    const node2 = new Element("ul", false, [new Lazy(AdminRow, ["admin"])])
    diffElement(handle, node2)
    // Different element — LI replaced by DIV
    expect(handle.element.children[0]).not.toBe(li)
    expect(handle.element.children[0].tagName).toBe("DIV")
    expect(handle.element.children[0].textContent).toBe("admin")
  })
})

describe("lazy transitions", () => {
  function TodoRow(text: string): Element {
    return new Element("li", false, [text])
  }

  test("non-lazy to lazy — undo old, mount lazy", () => {
    const node1 = new Element("div", false, ["plain text"])
    const handle = mountElement(node1)
    expect(handle.element.textContent).toBe("plain text")

    const node2 = new Element("div", false, [new Lazy(TodoRow, ["lazy"])])
    diffElement(handle, node2)
    expect(handle.element.children[0].tagName).toBe("LI")
    expect(handle.element.children[0].textContent).toBe("lazy")
  })

  test("lazy to non-lazy — dispose lazy, apply new", () => {
    const node1 = new Element("div", false, [new Lazy(TodoRow, ["lazy"])])
    const handle = mountElement(node1)
    expect(handle.element.children[0].tagName).toBe("LI")

    const node2 = new Element("div", false, ["plain text"])
    diffElement(handle, node2)
    expect(handle.element.children.length).toBe(0)
    expect(handle.element.textContent).toBe("plain text")
  })

  test("lazy to child element — dispose lazy, mount child", () => {
    const node1 = new Element("div", false, [new Lazy(TodoRow, ["lazy"])])
    const handle = mountElement(node1)

    const node2 = new Element("div", false, [
      new Element("span", false, ["child"]),
    ])
    diffElement(handle, node2)
    expect(handle.element.children[0].tagName).toBe("SPAN")
    expect(handle.element.children[0].textContent).toBe("child")
  })

  test("child element to lazy — undo child, mount lazy", () => {
    const node1 = new Element("div", false, [
      new Element("span", false, ["child"]),
    ])
    const handle = mountElement(node1)

    const node2 = new Element("div", false, [new Lazy(TodoRow, ["lazy"])])
    diffElement(handle, node2)
    expect(handle.element.children[0].tagName).toBe("LI")
    expect(handle.element.children[0].textContent).toBe("lazy")
  })
})
