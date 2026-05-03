// oxlint-disable complexity
import type { Classified } from "./classify"
import type { KeyedItem } from "./reconcile"
import type { Ref } from "@hypeup/vdom"

// ── Types ──────────────────────────────────────────────────────────

/** Mount state for a single element, used for diffing on redraw. */
export type MountHandle = {
  element: HTMLElement
  tag: string
  slots: SlotRecord[]
}

/** State for a mounted Each list, used for diffing on redraw. */
export type EachState = {
  parent: HTMLElement
  items: KeyedItem[]
  handles: Map<unknown, MountHandle>
  itemData: Map<unknown, unknown>
  lazyMeta?: Map<unknown, { fn: Function; args: unknown[] }>
  context: unknown
}

/** Record of what was applied at a single slot position. */
export type SlotRecord =
  | { kind: "text"; text: string; node: Text }
  | { kind: "class"; name: string }
  | { kind: "style"; name: string; value: string }
  | { kind: "attribute"; name: string; value: string }
  | { kind: "event"; event: string; handler: Function }
  | { kind: "child"; handle: MountHandle }
  | { kind: "each"; state: EachState }
  | { kind: "lazy"; fn: Function; args: unknown[]; handle: MountHandle }
  | { kind: "raw"; html: string; nodes: Node[] }
  | { kind: "attributes"; entries: [string, string][] }
  | { kind: "ref"; ref: Ref }
  | { kind: "array"; slots: SlotRecord[] }
  | { kind: "null" }

// ── Apply (leaf types) ─────────────────────────────────────────────

/** Apply a leaf classified value to a DOM element. Returns a SlotRecord. */
export function apply(
  element: HTMLElement,
  classified: Classified,
): SlotRecord {
  switch (classified.kind) {
    case "style": {
      element.style.setProperty(classified.name, classified.value)
      return { kind: "style", name: classified.name, value: classified.value }
    }
    case "attribute": {
      element.setAttribute(classified.name, classified.value)
      return {
        kind: "attribute",
        name: classified.name,
        value: classified.value,
      }
    }
    case "class": {
      element.classList.add(classified.name)
      return { kind: "class", name: classified.name }
    }
    case "event": {
      element.addEventListener(
        classified.event,
        classified.handler as EventListener,
      )
      return {
        kind: "event",
        event: classified.event,
        handler: classified.handler,
      }
    }
    case "raw": {
      const template = document.createElement("template")
      template.innerHTML = classified.html
      const fragment = template.content
      const nodes = Array.from(fragment.childNodes)
      element.appendChild(fragment)
      return { kind: "raw", html: classified.html, nodes }
    }
    case "text": {
      const node = document.createTextNode(classified.text)
      element.appendChild(node)
      return { kind: "text", text: classified.text, node }
    }
    case "attributes": {
      for (const [name, value] of classified.entries) {
        element.setAttribute(name, value)
      }
      return { kind: "attributes", entries: classified.entries }
    }
    default:
      return { kind: "null" }
  }
}

// ── Undo ───────────────────────────────────────────────────────────

/** Undo a slot's effect on the DOM. */
export function undoSlot(element: HTMLElement, slot: SlotRecord): void {
  switch (slot.kind) {
    case "text":
      element.removeChild(slot.node)
      break
    case "class":
      element.classList.remove(slot.name)
      break
    case "style":
      element.style.removeProperty(slot.name)
      break
    case "attribute":
      element.removeAttribute(slot.name)
      break
    case "event":
      element.removeEventListener(slot.event, slot.handler as EventListener)
      break
    case "child":
      disposeHandle(slot.handle)
      element.removeChild(slot.handle.element)
      break
    case "each":
      for (const item of slot.state.items) {
        item.dispose()
      }
      break
    case "lazy":
      disposeHandle(slot.handle)
      element.removeChild(slot.handle.element)
      break
    case "raw":
      for (const node of slot.nodes) {
        element.removeChild(node)
      }
      break
    case "attributes":
      for (const [name] of slot.entries) {
        element.removeAttribute(name)
      }
      break
    case "ref":
      slot.ref.current = null
      break
    case "array":
      for (const sub of slot.slots) {
        undoSlot(element, sub)
      }
      break
    case "null":
      break
  }
}

/** Recursively dispose all slots of a mount handle. */
export function disposeHandle(handle: MountHandle): void {
  for (const slot of handle.slots) {
    undoSlot(handle.element, slot)
  }
}

// ── Diff (leaf types) ──────────────────────────────────────────────

/** Diff a leaf slot against a new classified value. Returns updated SlotRecord. */
export function diffLeafSlot(
  element: HTMLElement,
  oldSlot: SlotRecord,
  classified: Classified,
): SlotRecord {
  switch (classified.kind) {
    case "text":
      if (oldSlot.kind === "text") {
        if (oldSlot.text === classified.text) {
          return oldSlot
        }
        oldSlot.node.data = classified.text
        return { kind: "text", text: classified.text, node: oldSlot.node }
      }
      break
    case "class":
      if (oldSlot.kind === "class") {
        if (oldSlot.name === classified.name) {
          return oldSlot
        }
        element.classList.remove(oldSlot.name)
        element.classList.add(classified.name)
        return { kind: "class", name: classified.name }
      }
      break
    case "style":
      if (oldSlot.kind === "style") {
        if (
          oldSlot.name === classified.name &&
          oldSlot.value === classified.value
        ) {
          return oldSlot
        }
        if (oldSlot.name !== classified.name) {
          element.style.removeProperty(oldSlot.name)
        }
        element.style.setProperty(classified.name, classified.value)
        return {
          kind: "style",
          name: classified.name,
          value: classified.value,
        }
      }
      break
    case "attribute":
      if (oldSlot.kind === "attribute") {
        if (
          oldSlot.name === classified.name &&
          oldSlot.value === classified.value
        ) {
          return oldSlot
        }
        if (oldSlot.name !== classified.name) {
          element.removeAttribute(oldSlot.name)
        }
        element.setAttribute(classified.name, classified.value)
        return {
          kind: "attribute",
          name: classified.name,
          value: classified.value,
        }
      }
      break
    case "event":
      if (oldSlot.kind === "event") {
        if (
          oldSlot.event === classified.event &&
          oldSlot.handler === classified.handler
        ) {
          return oldSlot
        }
        element.removeEventListener(
          oldSlot.event,
          oldSlot.handler as EventListener,
        )
        element.addEventListener(
          classified.event,
          classified.handler as EventListener,
        )
        return {
          kind: "event",
          event: classified.event,
          handler: classified.handler,
        }
      }
      break
    case "raw":
      if (oldSlot.kind === "raw") {
        if (oldSlot.html === classified.html) {
          return oldSlot
        }
        for (const node of oldSlot.nodes) {
          element.removeChild(node)
        }
        const template = document.createElement("template")
        template.innerHTML = classified.html
        const fragment = template.content
        const nodes = Array.from(fragment.childNodes)
        element.appendChild(fragment)
        return { kind: "raw", html: classified.html, nodes }
      }
      break
    case "attributes":
      if (oldSlot.kind === "attributes") {
        for (const [name] of oldSlot.entries) {
          element.removeAttribute(name)
        }
        for (const [name, value] of classified.entries) {
          element.setAttribute(name, value)
        }
        return { kind: "attributes", entries: classified.entries }
      }
      break
  }
  // Kind mismatch — undo old, apply new
  undoSlot(element, oldSlot)
  return apply(element, classified)
}
