import "@hypeup/lexicon"
import { mount, redraw } from "@hypeup/client"
import { App } from "./App"
import { state, type Filter } from "./state"

function parseHash(): Filter {
  const hash = window.location.hash
  if (hash === "#/active") return "active"
  if (hash === "#/completed") return "completed"
  return "all"
}

// Set initial filter from hash
state.filter = parseHash()

// Update filter on hash change
window.addEventListener("hashchange", () => {
  state.filter = parseHash()
  redraw()
})

// Mount the app
mount(document.getElementById("app")!, () => App())
