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

export function filteredTodos(): Todo[] {
  const f = state.filter
  if (f === "active") return state.todos.filter(t => !t.completed)
  if (f === "completed") return state.todos.filter(t => t.completed)
  return state.todos
}

export function activeCount(): number {
  return state.todos.filter(t => !t.completed).length
}

export function allCompleted(): boolean {
  return state.todos.length > 0 && state.todos.every(t => t.completed)
}

export function addTodo(title: string) {
  const trimmed = title.trim()
  if (!trimmed) return
  state.todos = [...state.todos, { id: nextId++, title: trimmed, completed: false }]
}

export function removeTodo(id: number) {
  state.todos = state.todos.filter(t => t.id !== id)
}

export function toggleTodo(id: number) {
  state.todos = state.todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
}

export function toggleAll() {
  const hasActive = state.todos.some(t => !t.completed)
  state.todos = state.todos.map(t => ({ ...t, completed: hasActive }))
}

export function clearCompleted() {
  state.todos = state.todos.filter(t => !t.completed)
}

export function editTodo(id: number, newTitle: string) {
  const trimmed = newTitle.trim()
  if (!trimmed) {
    removeTodo(id)
    return
  }
  state.todos = state.todos.map(t =>
    t.id === id ? { ...t, title: trimmed } : t
  )
}
