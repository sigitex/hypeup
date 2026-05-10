export type Filter = "all" | "active" | "completed"

export type Todo = {
  id: number
  title: string
  completed: boolean
}

let nextId = 1

export const state = {
  todos: [] as Todo[],
  filter: "all" as Filter,
}

// Queries

export function filteredTodos(): Todo[] {
  if (state.filter === "active") {
    return state.todos.filter((t) => !t.completed)
  }
  if (state.filter === "completed") {
    return state.todos.filter((t) => t.completed)
  }
  return state.todos
}

export function activeCount(): number {
  return state.todos.filter((t) => !t.completed).length
}

export function allCompleted(): boolean {
  return state.todos.length > 0 && state.todos.every((t) => t.completed)
}

// Mutations

export function addTodo(title: string) {
  const trimmed = title.trim()
  if (trimmed) {
    state.todos.push({ id: nextId++, title: trimmed, completed: false })
  }
}

export function removeTodo(id: number) {
  const i = state.todos.findIndex((t) => t.id === id)
  if (i !== -1) {
    state.todos.splice(i, 1)
  }
}

export function toggleTodo(id: number) {
  const todo = state.todos.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

export function toggleAll() {
  const target = state.todos.some((t) => !t.completed)
  for (const todo of state.todos) {
    todo.completed = target
  }
}

export function clearCompleted() {
  for (let i = state.todos.length - 1; i >= 0; i--) {
    if (state.todos[i].completed) {
      state.todos.splice(i, 1)
    }
  }
}

export function editTodo(id: number, newTitle: string) {
  const trimmed = newTitle.trim()
  if (!trimmed) {
    return removeTodo(id)
  }
  const todo = state.todos.find((t) => t.id === id)
  if (todo) {
    todo.title = trimmed
  }
}
