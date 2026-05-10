import "@hypeup/lexicon"
import { mount, redraw } from "@hypeup/client"
import { App } from "./App"
import { state, type Filter } from "./state"

// Set initial filter from hash
state.filter = parseHash()

// Update filter on hash change
globalThis.addEventListener("hashchange", () => {
  state.filter = parseHash()
  redraw()
})

// Mount the app
mount(document.getElementById("app")!, () => App())

function parseHash(): Filter {
  const hash = globalThis.location.hash
  if (hash === "#/active") {
    return "active"
  }
  if (hash === "#/completed") {
    return "completed"
  }
  return "all"
}