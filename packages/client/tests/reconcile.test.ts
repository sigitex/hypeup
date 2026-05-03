/** biome-ignore-all lint/suspicious/noExplicitAny: test file */
import { describe, test, expect } from "bun:test"
import { lis, reconcile, type KeyedItem } from "../src/reconcile"

// ── LIS Helper ─────────────────────────────────────────────────────

describe("lis", () => {
  test("empty array", () => {
    expect(lis([])).toEqual([])
  })

  test("single element", () => {
    expect(lis([5])).toEqual([0])
  })

  test("already sorted", () => {
    const result = lis([0, 1, 2, 3, 4])
    expect(result).toEqual([0, 1, 2, 3, 4])
  })

  test("reverse sorted", () => {
    const result = lis([4, 3, 2, 1, 0])
    // LIS length is 1
    expect(result.length).toBe(1)
  })

  test("mixed permutation [3, 1, 4, 1, 5, 9, 2, 6]", () => {
    // LIS: 1, 4, 5, 9 or 1, 4, 5, 6 (length 4)
    const result = lis([3, 1, 4, 1, 5, 9, 2, 6])
    expect(result.length).toBe(4)
    // Verify subsequence is increasing
    const arr = [3, 1, 4, 1, 5, 9, 2, 6]
    for (let i = 1; i < result.length; i++) {
      expect(arr[result[i]]).toBeGreaterThan(arr[result[i - 1]])
    }
  })

  test("move last to front: [1, 2, 3, 4, 0]", () => {
    // LIS: [1, 2, 3, 4] at indices [0, 1, 2, 3]
    const result = lis([1, 2, 3, 4, 0])
    expect(result.length).toBe(4)
  })

  test("swap two elements: [0, 3, 2, 1, 4]", () => {
    // LIS: [0, 2, 4] or [0, 1, 4] — length 3
    const result = lis([0, 3, 2, 1, 4])
    expect(result.length).toBe(3)
  })

  test("all equal values", () => {
    // All same: LIS length 1
    const result = lis([5, 5, 5, 5])
    expect(result.length).toBe(1)
  })

  test("two elements swapped", () => {
    const result = lis([1, 0])
    expect(result.length).toBe(1)
  })
})

// ── Reconciler ─────────────────────────────────────────────────────

// For reconciler tests we need a minimal DOM mock since bun:test runs in a
// simulated environment. We test through the reconcile function directly.

/** Create a minimal mock parent node. */
function mockParent() {
  const children: Node[] = []
  return {
    get childNodes() {
      return children
    },
    appendChild(node: Node) {
      children.push(node)
      return node
    },
    insertBefore(node: Node, ref: Node | null) {
      // Remove if already present (move)
      const existingIdx = children.indexOf(node)
      if (existingIdx !== -1) {
        children.splice(existingIdx, 1)
      }
      const insertIdx = ref ? children.indexOf(ref) : children.length
      children.splice(insertIdx === -1 ? children.length : insertIdx, 0, node)
      return node
    },
    removeChild(node: Node) {
      const idx = children.indexOf(node)
      if (idx !== -1) {
        children.splice(idx, 1)
      }
      return node
    },
  } as unknown as Node
}

function mockNode(label: string): Node {
  return { _label: label } as unknown as Node
}

describe("reconcile", () => {
  test("empty to populated", () => {
    const parent = mockParent()
    const mounted: unknown[] = []
    const result = reconcile(parent, [], [1, 2, 3], (key) => {
      mounted.push(key)
      const node = mockNode(String(key))
      return { key, node, dispose() {} }
    })
    expect(result.length).toBe(3)
    expect(mounted).toEqual([1, 2, 3])
    expect(result.map((i) => i.key)).toEqual([1, 2, 3])
  })

  test("populated to empty", () => {
    const parent = mockParent()
    const disposed: unknown[] = []
    const oldItems: KeyedItem[] = [1, 2, 3].map((key) => ({
      key,
      node: mockNode(String(key)),
      dispose() {
        disposed.push(key)
      },
    }))
    const result = reconcile(parent, oldItems, [], () => {
      throw new Error("should not mount")
    })
    expect(result.length).toBe(0)
    expect(disposed).toEqual([1, 2, 3])
  })

  test("append items to end", () => {
    const parent = mockParent()
    const oldItems: KeyedItem[] = [1, 2, 3].map((key) => {
      const node = mockNode(String(key))
      parent.appendChild(node)
      return { key, node, dispose() {} }
    })
    const mounted: unknown[] = []
    const result = reconcile(parent, oldItems, [1, 2, 3, 4, 5], (key) => {
      mounted.push(key)
      return { key, node: mockNode(String(key)), dispose() {} }
    })
    expect(result.length).toBe(5)
    expect(mounted).toEqual([4, 5])
    // Old items should be preserved
    expect(result[0].node).toBe(oldItems[0].node)
    expect(result[1].node).toBe(oldItems[1].node)
    expect(result[2].node).toBe(oldItems[2].node)
  })

  test("remove items from middle", () => {
    const parent = mockParent()
    const disposed: unknown[] = []
    const oldItems: KeyedItem[] = [1, 2, 3, 4, 5].map((key) => {
      const node = mockNode(String(key))
      parent.appendChild(node)
      return {
        key,
        node,
        dispose() {
          disposed.push(key)
        },
      }
    })
    const result = reconcile(parent, oldItems, [1, 3, 5], () => {
      throw new Error("should not mount")
    })
    expect(result.length).toBe(3)
    expect(disposed).toEqual([2, 4])
    expect(result[0].node).toBe(oldItems[0].node)
    expect(result[1].node).toBe(oldItems[2].node)
    expect(result[2].node).toBe(oldItems[4].node)
  })

  test("swap two items", () => {
    const parent = mockParent()
    const oldItems: KeyedItem[] = [1, 2, 3, 4, 5].map((key) => {
      const node = mockNode(String(key))
      parent.appendChild(node)
      return { key, node, dispose() {} }
    })
    const result = reconcile(parent, oldItems, [1, 4, 3, 2, 5], () => {
      throw new Error("should not mount")
    })
    expect(result.length).toBe(5)
    expect(result.map((i) => i.key)).toEqual([1, 4, 3, 2, 5])
    // DOM nodes preserved (moved, not recreated)
    expect(result[0].node).toBe(oldItems[0].node)
    expect(result[1].node).toBe(oldItems[3].node)
    expect(result[2].node).toBe(oldItems[2].node)
    expect(result[3].node).toBe(oldItems[1].node)
    expect(result[4].node).toBe(oldItems[4].node)
  })

  test("full replacement", () => {
    const parent = mockParent()
    const disposed: unknown[] = []
    const oldItems: KeyedItem[] = [1, 2, 3].map((key) => {
      const node = mockNode(String(key))
      parent.appendChild(node)
      return {
        key,
        node,
        dispose() {
          disposed.push(key)
        },
      }
    })
    const mounted: unknown[] = []
    const result = reconcile(parent, oldItems, [4, 5, 6], (key) => {
      mounted.push(key)
      return { key, node: mockNode(String(key)), dispose() {} }
    })
    expect(result.length).toBe(3)
    expect(disposed).toEqual([1, 2, 3])
    expect(mounted).toEqual([4, 5, 6])
  })

  test("reverse order", () => {
    const parent = mockParent()
    const oldItems: KeyedItem[] = [1, 2, 3, 4, 5].map((key) => {
      const node = mockNode(String(key))
      parent.appendChild(node)
      return { key, node, dispose() {} }
    })
    const result = reconcile(parent, oldItems, [5, 4, 3, 2, 1], () => {
      throw new Error("should not mount")
    })
    expect(result.length).toBe(5)
    expect(result.map((i) => i.key)).toEqual([5, 4, 3, 2, 1])
    // All original nodes preserved
    for (let i = 0; i < 5; i++) {
      expect(result[i].node).toBe(oldItems[4 - i].node)
    }
  })

  test("single item moved to end", () => {
    const parent = mockParent()
    const oldItems: KeyedItem[] = [1, 2, 3, 4, 5].map((key) => {
      const node = mockNode(String(key))
      parent.appendChild(node)
      return { key, node, dispose() {} }
    })
    const result = reconcile(parent, oldItems, [2, 3, 4, 5, 1], () => {
      throw new Error("should not mount")
    })
    expect(result.length).toBe(5)
    expect(result.map((i) => i.key)).toEqual([2, 3, 4, 5, 1])
    // Key 1's node moved to end
    expect(result[4].node).toBe(oldItems[0].node)
  })
})
