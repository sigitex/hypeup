import { addTodo } from "./state"

export function HeaderSection() {
  return header.header(
    h1("todos"),
    input.newTodo(
      { placeholder: "What needs to be done?", autofocus: "true" },
      on("keydown", handleNewTodoKeydown),
    ),
  )
}

function handleNewTodoKeydown(e: KeyboardEvent) {
  if (e.key !== "Enter") {
    return
  }
  const el = e.target as HTMLInputElement
  addTodo(el.value)
  el.value = ""
}
