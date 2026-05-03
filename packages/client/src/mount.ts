// oxlint-disable complexity
import type { Element } from "@hypeup/vdom"
import {
  apply,
  undoSlot,
  diffLeafSlot,
  disposeHandle,
  type MountHandle,
  type SlotRecord,
} from "./apply"
import { classify, type Classified } from "./classify"
import { mountEach, diffEach } from "./each"
import { setRedrawTarget, clearRedrawTarget } from "./redraw"

// oxlint-disable-next-line typescript/no-explicit-any
type Content = any

/** App handle returned by mount(). */
export type AppHandle = {
  redraw(): void
  dispose(): void
}

/** Mount a component function into a root element. Returns a redraw/dispose handle. */
export function mount(
  root: HTMLElement,
  componentFn: () => Element,
): AppHandle {
  let disposed = false

  // Initial render
  const vdom = componentFn()
  const handle = mountElement(vdom)
  root.appendChild(handle.element)

  // Redraw function
  const doRedraw = () => {
    if (disposed) {
      return
    }
    const newVdom = componentFn()
    diffElement(handle, newVdom)
  }

  setRedrawTarget(doRedraw)

  return {
    redraw: doRedraw,
    dispose() {
      if (disposed) {
        return
      }
      disposed = true
      clearRedrawTarget()
      root.removeChild(handle.element)
      disposeHandle(handle)
    },
  }
}

/** Create a DOM element from a vdom Element. Returns MountHandle for diffing. */
export function mountElement(node: Element): MountHandle {
  const element = document.createElement(node.tag)
  const slots: SlotRecord[] = []

  for (const arg of node.contents) {
    slots.push(processArg(element, arg))
  }

  return { element, tag: node.tag, slots }
}

/** Diff an existing MountHandle against a new vdom Element. Patches DOM in place. */
export function diffElement(handle: MountHandle, newVdom: Element): void {
  const oldSlots = handle.slots
  const newArgs = newVdom.contents
  const maxLen = Math.max(oldSlots.length, newArgs.length)
  const newSlots: SlotRecord[] = []

  for (let i = 0; i < maxLen; i++) {
    if (i < oldSlots.length && i < newArgs.length) {
      newSlots.push(diffSlot(handle.element, oldSlots[i], newArgs[i]))
    } else if (i < newArgs.length) {
      newSlots.push(processArg(handle.element, newArgs[i]))
    } else {
      undoSlot(handle.element, oldSlots[i])
    }
  }

  handle.slots = newSlots
}

// ── Internal ───────────────────────────────────────────────────────

/** Resolve a content arg — call functions (babel thunks) once. */
function resolveArg(arg: Content): Content {
  return typeof arg === "function" ? arg() : arg
}

/** Process a single content arg: resolve, classify, apply. */
function processArg(element: HTMLElement, arg: Content): SlotRecord {
  const value = resolveArg(arg)
  const classified = classify(value)
  if (classified === null) {
    return { kind: "null" }
  }
  return applyClassified(element, classified)
}

/** Apply a classified value, handling structural types (child/each/array) at the mount level. */
function applyClassified(
  element: HTMLElement,
  classified: Classified,
): SlotRecord {
  switch (classified.kind) {
    case "child": {
      const childHandle = mountElement(classified.node)
      element.appendChild(childHandle.element)
      return { kind: "child", handle: childHandle }
    }
    case "each": {
      const state = mountEach(element, classified.each)
      return { kind: "each", state }
    }
    case "lazy": {
      const lazy = classified.lazy
      const result = lazy.fn(...lazy.args) as Element
      const handle = mountElement(result)
      element.appendChild(handle.element)
      return { kind: "lazy", fn: lazy.fn, args: lazy.args, handle }
    }
    case "ref": {
      classified.ref.current = element
      return { kind: "ref", ref: classified.ref }
    }
    case "array": {
      const subSlots: SlotRecord[] = []
      for (const item of classified.items) {
        subSlots.push(processArg(element, item))
      }
      return { kind: "array", slots: subSlots }
    }
    default:
      return apply(element, classified)
  }
}

/** Diff a single slot against a new arg. */
function diffSlot(
  element: HTMLElement,
  oldSlot: SlotRecord,
  newArg: Content,
): SlotRecord {
  const value = resolveArg(newArg)
  const classified = classify(value)

  // New is null
  if (classified === null) {
    if (oldSlot.kind === "null") {
      return oldSlot
    }
    undoSlot(element, oldSlot)
    return { kind: "null" }
  }

  // Old is null — fresh apply
  if (oldSlot.kind === "null") {
    return applyClassified(element, classified)
  }

  // Child elements
  if (classified.kind === "child") {
    if (
      oldSlot.kind === "child" &&
      oldSlot.handle.tag === classified.node.tag
    ) {
      diffElement(oldSlot.handle, classified.node)
      return oldSlot
    }
    undoSlot(element, oldSlot)
    const childHandle = mountElement(classified.node)
    element.appendChild(childHandle.element)
    return { kind: "child", handle: childHandle }
  }

  // Each nodes
  if (classified.kind === "each") {
    if (oldSlot.kind === "each") {
      diffEach(oldSlot.state, classified.each)
      return oldSlot
    }
    undoSlot(element, oldSlot)
    const state = mountEach(element, classified.each)
    return { kind: "each", state }
  }

  // Lazy nodes
  if (classified.kind === "lazy") {
    if (oldSlot.kind === "lazy") {
      if (oldSlot.fn === classified.lazy.fn) {
        if (argsEqual(oldSlot.args, classified.lazy.args)) {
          // Same fn + same args — skip entirely
          return oldSlot
        }
        // Same fn + different args — re-call, diff result
        const result = classified.lazy.fn(...classified.lazy.args) as Element
        diffElement(oldSlot.handle, result)
        oldSlot.args = classified.lazy.args
        return oldSlot
      }
      // Different fn — dispose and remount
      undoSlot(element, oldSlot)
      const result = classified.lazy.fn(...classified.lazy.args) as Element
      const handle = mountElement(result)
      element.appendChild(handle.element)
      return {
        kind: "lazy",
        fn: classified.lazy.fn,
        args: classified.lazy.args,
        handle,
      }
    }
    // Old was non-lazy — undo and mount fresh
    undoSlot(element, oldSlot)
    const result = classified.lazy.fn(...classified.lazy.args) as Element
    const handle = mountElement(result)
    element.appendChild(handle.element)
    return {
      kind: "lazy",
      fn: classified.lazy.fn,
      args: classified.lazy.args,
      handle,
    }
  }

  // Arrays
  if (classified.kind === "array") {
    if (oldSlot.kind === "array") {
      const oldSubs = oldSlot.slots
      const newItems = classified.items
      const maxLen = Math.max(oldSubs.length, newItems.length)
      const newSubs: SlotRecord[] = []
      for (let i = 0; i < maxLen; i++) {
        if (i < oldSubs.length && i < newItems.length) {
          newSubs.push(diffSlot(element, oldSubs[i], newItems[i]))
        } else if (i < newItems.length) {
          newSubs.push(processArg(element, newItems[i]))
        } else {
          undoSlot(element, oldSubs[i])
        }
      }
      return { kind: "array", slots: newSubs }
    }
    undoSlot(element, oldSlot)
    const subSlots: SlotRecord[] = []
    for (const item of classified.items) {
      subSlots.push(processArg(element, item))
    }
    return { kind: "array", slots: subSlots }
  }

  // Refs
  if (classified.kind === "ref") {
    if (oldSlot.kind === "ref") {
      if (oldSlot.ref !== classified.ref) {
        oldSlot.ref.current = null
        classified.ref.current = element
      }
      return { kind: "ref", ref: classified.ref }
    }
    undoSlot(element, oldSlot)
    classified.ref.current = element
    return { kind: "ref", ref: classified.ref }
  }

  // Leaf types
  return diffLeafSlot(element, oldSlot, classified)
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
