// oxlint-disable unicorn/prefer-modern-dom-apis
// oxlint-disable unicorn/no-new-array

// Keyed list reconciliation using Ivi's LIS-based algorithm.

export type KeyedItem = {
  key: unknown
  node: Node
  dispose: () => void
  updateItem?: (item: unknown) => void
}

/**
 * Reconcile old keyed items against new keys with minimal DOM mutations.
 * Calls `mount(key)` for each new key that needs a fresh DOM node.
 * Returns the new `KeyedItem[]` in the order of `newKeys`.
 */
export function reconcile(
  parent: Node,
  oldItems: KeyedItem[],
  newKeys: unknown[],
  mount: (key: unknown) => KeyedItem,
): KeyedItem[] {
  const oldLen = oldItems.length
  const newLen = newKeys.length

  // Fast path: empty → populated
  if (oldLen === 0) {
    const result: KeyedItem[] = []
    for (let i = 0; i < newLen; i++) {
      const item = mount(newKeys[i])
      parent.appendChild(item.node)
      result.push(item)
    }
    return result
  }

  // Fast path: populated → empty
  if (newLen === 0) {
    for (let i = 0; i < oldLen; i++) {
      oldItems[i].dispose()
    }
    return []
  }

  // Build old key → index map
  const oldKeyIndex = new Map<unknown, number>()
  for (let i = 0; i < oldLen; i++) {
    oldKeyIndex.set(oldItems[i].key, i)
  }

  // Map new keys to old indices (or -1 if new)
  const newToOld: number[] = new Array(newLen)
  const newItems: (KeyedItem | null)[] = new Array(newLen)
  const removedSet = new Set<number>()

  // Mark all old indices as potentially removed
  for (let i = 0; i < oldLen; i++) {
    removedSet.add(i)
  }

  for (let i = 0; i < newLen; i++) {
    const key = newKeys[i]
    const oldIdx = oldKeyIndex.get(key)
    if (oldIdx !== undefined) {
      newToOld[i] = oldIdx
      newItems[i] = oldItems[oldIdx]
      removedSet.delete(oldIdx)
    } else {
      newToOld[i] = -1
      newItems[i] = null
    }
  }

  // Dispose removed items
  for (const idx of removedSet) {
    oldItems[idx].dispose()
  }

  // Find LIS of old indices among surviving items (determines which nodes don't move)
  const survivingOldIndices: number[] = []
  const survivingNewIndices: number[] = []
  for (let i = 0; i < newLen; i++) {
    if (newToOld[i] !== -1) {
      survivingOldIndices.push(newToOld[i])
      survivingNewIndices.push(i)
    }
  }

  const lisPositions = lis(survivingOldIndices)
  const lisSet = new Set<number>()
  for (const pos of lisPositions) {
    lisSet.add(survivingNewIndices[pos])
  }

  // Mount new items
  for (let i = 0; i < newLen; i++) {
    if (newItems[i] === null) {
      newItems[i] = mount(newKeys[i])
    }
  }

  // Apply DOM mutations: iterate right-to-left, inserting before the next sibling
  let nextSibling: Node | null = null
  for (let i = newLen - 1; i >= 0; i--) {
    const item = newItems[i]!
    if (newToOld[i] === -1) {
      // New item — insert
      parent.insertBefore(item.node, nextSibling)
    } else if (!lisSet.has(i)) {
      // Surviving but moved — reposition
      parent.insertBefore(item.node, nextSibling)
    }
    // LIS items stay in place (already in correct relative order)
    nextSibling = item.node
  }

  return newItems as KeyedItem[]
}

/** Longest increasing subsequence — returns indices into the input array. */
export function lis(arr: number[]): number[] {
  const n = arr.length
  if (n === 0) {
    return []
  }

  // tails[i] = index in arr of smallest tail element for IS of length i+1
  const tails: number[] = [0]
  // predecessor[i] = index in arr of element before arr[i] in the LIS
  const predecessor: number[] = new Array(n).fill(-1)

  for (let i = 1; i < n; i++) {
    const val = arr[i]

    if (val > arr[tails[tails.length - 1]]) {
      predecessor[i] = tails[tails.length - 1]
      tails.push(i)
      continue
    }

    // Binary search for leftmost tail >= val
    let lo = 0
    let hi = tails.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (arr[tails[mid]] < val) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }

    if (val < arr[tails[lo]]) {
      if (lo > 0) {
        predecessor[i] = tails[lo - 1]
      }
      tails[lo] = i
    }
  }

  // Reconstruct
  const result: number[] = new Array(tails.length)
  let k = tails[tails.length - 1]
  for (let i = result.length - 1; i >= 0; i--) {
    result[i] = k
    k = predecessor[k]
  }

  return result
}
