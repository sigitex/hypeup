import { type Element, Each, Lazy } from "@hypeup/vdom"
import { disposeHandle, type EachState, type MountHandle } from "./apply"
import { mountElement, diffElement } from "./mount"
import { type KeyedItem, reconcile } from "./reconcile"

/** Per-key lazy metadata for arg-comparison-based skipping. */
type LazyMeta = { fn: Function; args: unknown[] }

/** Resolve a mapFn result — if Lazy, call fn(...args) to get Element. */
function resolveLazy(vdom: Element | Lazy): Element {
  if (vdom instanceof Lazy) {
    return vdom.fn(...vdom.args) as Element
  }
  return vdom
}

/** Shallow-compare two argument arrays using strict equality. */
function argsEqual(prev: unknown[], next: unknown[]): boolean {
  if (prev.length !== next.length) {
    return false
  }
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) {
      return false
    }
  }
  return true
}

/** Mount an Each node into a parent DOM element. Returns EachState for diffing. */
export function mountEach(parent: HTMLElement, eachNode: Each): EachState {
  const handles = new Map<unknown, MountHandle>()
  const itemData = new Map<unknown, unknown>()
  const lazyMeta = new Map<unknown, LazyMeta>()
  // oxlint-disable-next-line typescript/no-explicit-any
  const items: any[] = eachNode.items
  const len = items.length
  // oxlint-disable-next-line unicorn/no-new-array
  const keys: unknown[] = new Array(len)

  for (let i = 0; i < len; i++) {
    keys[i] = eachNode.keyFn(items[i], i)
  }

  const keyedItems = reconcile(parent, [], keys, (key) => {
    const index = keys.indexOf(key)
    const item = items[index]
    const vdom = eachNode.mapFn(item, index)
    if (vdom instanceof Lazy) {
      lazyMeta.set(key, { fn: vdom.fn, args: vdom.args })
    }
    const handle = mountElement(resolveLazy(vdom))
    handles.set(key, handle)
    itemData.set(key, item)
    return createKeyedItem(key, handle, handles)
  })

  return {
    parent,
    items: keyedItems,
    handles,
    itemData,
    lazyMeta,
    context: eachNode.context,
  }
}

/** Diff an EachState against a new Each node. Patches DOM in place. */
export function diffEach(state: EachState, newEach: Each): void {
  const { parent, handles, itemData } = state
  const lazyMeta = state.lazyMeta ?? new Map<unknown, LazyMeta>()
  // oxlint-disable-next-line typescript/no-explicit-any
  const items: any[] = newEach.items
  const len = items.length
  // oxlint-disable-next-line unicorn/no-new-array
  const keys: unknown[] = new Array(len)
  const newlyCreated = new Set<unknown>()

  for (let i = 0; i < len; i++) {
    keys[i] = newEach.keyFn(items[i], i)
  }

  state.items = reconcile(parent, state.items, keys, (key) => {
    newlyCreated.add(key)
    const index = keys.indexOf(key)
    const item = items[index]
    const vdom = newEach.mapFn(item, index)
    if (vdom instanceof Lazy) {
      lazyMeta.set(key, { fn: vdom.fn, args: vdom.args })
    } else {
      lazyMeta.delete(key)
    }
    const handle = mountElement(resolveLazy(vdom))
    handles.set(key, handle)
    itemData.set(key, item)
    return createKeyedItem(key, handle, handles)
  })

  // Diff reused items — skip if item reference AND context are unchanged
  const contextChanged = newEach.context !== state.context
  state.context = newEach.context
  for (let i = 0; i < len; i++) {
    const key = keys[i]
    if (newlyCreated.has(key)) {
      continue
    }
    const item = items[i]
    const prevItem = itemData.get(key)
    if (!contextChanged && item === prevItem) {
      continue
    } // unchanged — skip
    itemData.set(key, item)
    const handle = handles.get(key)
    if (handle) {
      const vdom = newEach.mapFn(item, i)
      // Lazy skip: same fn + same args → skip entirely
      if (vdom instanceof Lazy) {
        const prev = lazyMeta.get(key)
        if (prev && prev.fn === vdom.fn && argsEqual(prev.args, vdom.args)) {
          continue // skip — lazy args unchanged
        }
        lazyMeta.set(key, { fn: vdom.fn, args: vdom.args })
        diffElement(handle, resolveLazy(vdom))
      } else {
        lazyMeta.delete(key)
        diffElement(handle, vdom)
      }
    }
  }
}

// ── Internal ───────────────────────────────────────────────────────

/** Create a KeyedItem that tracks its MountHandle for disposal. */
function createKeyedItem(
  key: unknown,
  handle: MountHandle,
  handles: Map<unknown, MountHandle>,
): KeyedItem {
  return {
    key,
    get node(): Node {
      return handle.element
    },
    dispose() {
      disposeHandle(handle)
      handles.delete(key)
      handle.element.remove()
    },
  }
}
