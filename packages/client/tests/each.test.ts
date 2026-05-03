/** biome-ignore-all lint/suspicious/noExplicitAny: test file */
import "./setup-dom"
import { describe, test, expect } from "bun:test"
import { each, mountEach, diffEach } from "../src/each"
import { mount } from "../src/mount"
import { Element } from "@hypeup/vdom"

// ── each() initial render ──────────────────────────────────────────

describe("each() initial render", () => {
  test("renders items into parent", () => {
    const items = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
      { id: 3, label: "c" },
    ]

    const parent = document.createElement("ul")
    const eachNode = each(
      items,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    mountEach(parent, eachNode)

    expect(parent.children.length).toBe(3)
    expect(parent.children[0].textContent).toBe("a")
    expect(parent.children[1].textContent).toBe("b")
    expect(parent.children[2].textContent).toBe("c")
  })

  test("empty array produces no DOM", () => {
    const parent = document.createElement("ul")
    const eachNode = each(
      [] as { id: number; label: string }[],
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    mountEach(parent, eachNode)
    expect(parent.children.length).toBe(0)
  })

  test("two-argument overload (index-keyed)", () => {
    const parent = document.createElement("ul")
    const eachNode = each(
      ["a", "b", "c"],
      (item) => new Element("li", false, [item]),
    )
    mountEach(parent, eachNode)

    expect(parent.children.length).toBe(3)
    expect(parent.children[0].textContent).toBe("a")
    expect(parent.children[1].textContent).toBe("b")
    expect(parent.children[2].textContent).toBe("c")
  })
})

// ── diffEach ───────────────────────────────────────────────────────

describe("each() diffEach", () => {
  test("append item creates new DOM node", () => {
    const parent = document.createElement("ul")
    const items1 = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
    ]
    const eachNode1 = each(
      items1,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    const state = mountEach(parent, eachNode1)

    expect(parent.children.length).toBe(2)

    const items2 = [...items1, { id: 3, label: "c" }]
    const eachNode2 = each(
      items2,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    diffEach(state, eachNode2)

    expect(parent.children.length).toBe(3)
    expect(parent.children[2].textContent).toBe("c")
  })

  test("remove item removes DOM node", () => {
    const parent = document.createElement("ul")
    const items1 = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
      { id: 3, label: "c" },
    ]
    const eachNode1 = each(
      items1,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    const state = mountEach(parent, eachNode1)

    const items2 = [items1[0], items1[2]] // remove id:2
    const eachNode2 = each(
      items2,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    diffEach(state, eachNode2)

    expect(parent.children.length).toBe(2)
    expect(parent.children[0].textContent).toBe("a")
    expect(parent.children[1].textContent).toBe("c")
  })

  test("swap items reorders DOM", () => {
    const parent = document.createElement("ul")
    const items1 = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
      { id: 3, label: "c" },
    ]
    const eachNode1 = each(
      items1,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    const state = mountEach(parent, eachNode1)

    const node1 = parent.children[0]
    const node3 = parent.children[2]

    const items2 = [items1[2], items1[1], items1[0]] // reverse
    const eachNode2 = each(
      items2,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    diffEach(state, eachNode2)

    expect(parent.children.length).toBe(3)
    expect(parent.children[0]).toBe(node3)
    expect(parent.children[2]).toBe(node1)
  })

  test("item content change diffs child slots", () => {
    const parent = document.createElement("ul")
    const items1 = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
    ]
    const eachNode1 = each(
      items1,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    const state = mountEach(parent, eachNode1)

    const node1 = parent.children[0]

    // Same keys, different labels
    const items2 = [
      { id: 1, label: "A" },
      { id: 2, label: "B" },
    ]
    const eachNode2 = each(
      items2,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    diffEach(state, eachNode2)

    expect(parent.children.length).toBe(2)
    expect(parent.children[0].textContent).toBe("A")
    expect(parent.children[1].textContent).toBe("B")
    // Reused DOM node
    expect(parent.children[0]).toBe(node1)
  })

  test("empty to populated", () => {
    const parent = document.createElement("ul")
    const eachNode1 = each(
      [] as { id: number; label: string }[],
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    const state = mountEach(parent, eachNode1)
    expect(parent.children.length).toBe(0)

    const items2 = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
    ]
    const eachNode2 = each(
      items2,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    diffEach(state, eachNode2)

    expect(parent.children.length).toBe(2)
    expect(parent.children[0].textContent).toBe("a")
  })

  test("populated to empty", () => {
    const parent = document.createElement("ul")
    const items1 = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
    ]
    const eachNode1 = each(
      items1,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    const state = mountEach(parent, eachNode1)
    expect(parent.children.length).toBe(2)

    const eachNode2 = each(
      [] as typeof items1,
      (t) => t.id,
      (t) => new Element("li", false, [t.label]),
    )
    diffEach(state, eachNode2)
    expect(parent.children.length).toBe(0)
  })
})

// ── each() via mount + redraw ──────────────────────────────────────

describe("each() via mount + redraw", () => {
  test("redraw with new items updates DOM", () => {
    const state = { items: [{ id: 1, label: "a" }] }
    const root = document.createElement("div")
    const app = mount(root, () =>
      new Element("ul", false, [
        each(
          state.items,
          (t) => t.id,
          (t) => new Element("li", false, [t.label]),
        ),
      ]),
    )

    const ul = root.children[0]
    expect(ul.children.length).toBe(1)

    state.items = [
      { id: 1, label: "a" },
      { id: 2, label: "b" },
    ]
    app.redraw()

    expect(ul.children.length).toBe(2)
    expect(ul.children[1].textContent).toBe("b")

    app.dispose()
  })
})
