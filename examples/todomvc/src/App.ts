import { state } from "./state"
import { HeaderSection } from "./HeaderSection"
import { MainSection } from "./MainSection"
import { FooterSection } from "./FooterSection"

export function App() {
  return section.todoapp(
    HeaderSection(),
    state.todos.length > 0 ? MainSection() : false,
    state.todos.length > 0 ? FooterSection() : false,
  )
}
