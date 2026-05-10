import { state, activeCount, clearCompleted } from "./state"

export function FooterSection() {
  const count = activeCount()
  return footer.footer(
    span.todoCount(
      strong(String(count)),
      count === 1 ? " item left" : " items left",
    ),
    ul.filters(
      li(
        a(
          state.filter === "all" && className("selected"),
          { href: "#/" },
          "All",
        ),
      ),
      li(
        a(
          state.filter === "active" && className("selected"),
          { href: "#/active" },
          "Active",
        ),
      ),
      li(
        a(
          state.filter === "completed" && className("selected"),
          { href: "#/completed" },
          "Completed",
        ),
      ),
    ),
    state.todos.some((t) => t.completed)
      ? button.clearCompleted(
          "Clear completed",
          on("click", () => clearCompleted()),
        )
      : false,
  )
}
