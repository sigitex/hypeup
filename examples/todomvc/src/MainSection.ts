import { allCompleted, filteredTodos, toggleAll, type Todo } from "./state"
import { TodoItem } from "./TodoItem"

export function MainSection() {
  return section.main(
    input.toggleAll(
      { id: "toggle-all", type: "checkbox" },
      allCompleted() ? { checked: "checked" } : false,
      on("change", () => toggleAll()),
    ),
    label({ for: "toggle-all" }, "Mark all as complete"),
    ul.todoList(
      each(
        filteredTodos(),
        (todo: Todo) => todo.id,
        (todo: Todo) => TodoItem(todo),
      ),
    ),
  )
}
