import { editTodo, removeTodo, toggleTodo, type Todo } from "./state"

const editing = { id: null as number | null }
const editInput = ref<HTMLInputElement>()

export function TodoItem(todo: Todo) {
  return li(
    todo.completed && className("completed"),
    editing.id === todo.id && className("editing"),
    div.view(
      input.toggle(
        { type: "checkbox" },
        todo.completed ? { checked: "checked" } : false,
        on("change", () => toggleTodo(todo.id)),
      ),
      label(
        todo.title,
        on("dblclick", () => startEditing(todo)),
      ),
      button.destroy(on("click", () => removeTodo(todo.id))),
    ),
    editing.id === todo.id &&
      input.edit(
        editInput,
        { value: todo.title },
        on("keydown", (e) => handleEditKeydown(todo, e)),
        on("blur", (e) => handleEditBlur(todo, e)),
      ),
  )
}

function startEditing(todo: Todo) {
  editing.id = todo.id
  requestAnimationFrame(() => {
    if (editInput.current) {
      editInput.current.value = todo.title
      editInput.current.focus()
    }
  })
}

function commitEdit(todo: Todo, value: string) {
  editTodo(todo.id, value)
  editing.id = null
}

function cancelEdit() {
  editing.id = null
}

function handleEditKeydown(todo: Todo, e: KeyboardEvent) {
  if (e.key === "Enter") {
    commitEdit(todo, (e.target as HTMLInputElement).value)
  } else if (e.key === "Escape") {
    cancelEdit()
  }
}

function handleEditBlur(todo: Todo, e: FocusEvent) {
  if (editing.id === todo.id) {
    commitEdit(todo, (e.target as HTMLInputElement).value)
  }
}
