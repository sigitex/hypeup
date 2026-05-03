## ADDED Requirements

### Requirement: Add a new todo item
The app SHALL provide a text input at the top of the page. When the user types a title and presses Enter, the app SHALL create a new todo item with that title and `completed: false`, and clear the input. The app SHALL trim whitespace from the title and SHALL NOT create an item if the trimmed title is empty.

#### Scenario: Add a todo by pressing Enter
- **WHEN** user types "Buy milk" into the input and presses Enter
- **THEN** a new todo "Buy milk" appears in the list with unchecked state and the input is cleared

#### Scenario: Ignore empty input
- **WHEN** user presses Enter with only whitespace in the input
- **THEN** no todo is created and the input is cleared

### Requirement: Display todo items as a list
The app SHALL render all todo items in a list. Each item SHALL display its title and a checkbox reflecting its completed state. Items SHALL be rendered in insertion order.

#### Scenario: Render multiple todos
- **WHEN** the user has added "Buy milk" and "Walk dog"
- **THEN** both items appear in the list in that order, each with an unchecked checkbox

### Requirement: Toggle a single todo's completed state
Each todo item SHALL have a checkbox. Clicking the checkbox SHALL toggle the item between completed and active. Completed items SHALL have a visual strikethrough style.

#### Scenario: Mark a todo as completed
- **WHEN** user clicks the checkbox on an active todo "Buy milk"
- **THEN** the todo shows as completed with strikethrough text

#### Scenario: Reactivate a completed todo
- **WHEN** user clicks the checkbox on a completed todo "Buy milk"
- **THEN** the todo shows as active without strikethrough

### Requirement: Delete a todo item
Each todo item SHALL have a destroy button (visible on hover). Clicking it SHALL remove the item from the list.

#### Scenario: Delete a todo
- **WHEN** user clicks the destroy button on "Buy milk"
- **THEN** "Buy milk" is removed from the list

### Requirement: Edit a todo item
Double-clicking a todo label SHALL activate editing mode for that item, showing an input pre-filled with the current title. Pressing Enter or blurring the input SHALL save the trimmed title. If the trimmed title is empty, the todo SHALL be deleted. Pressing Escape SHALL cancel editing and restore the original title.

#### Scenario: Edit and save a todo
- **WHEN** user double-clicks "Buy milk", changes text to "Buy almond milk", and presses Enter
- **THEN** the todo title updates to "Buy almond milk"

#### Scenario: Cancel editing with Escape
- **WHEN** user double-clicks "Buy milk", changes text to "something", and presses Escape
- **THEN** the todo title remains "Buy milk"

#### Scenario: Delete by clearing title
- **WHEN** user double-clicks "Buy milk", clears the input, and presses Enter
- **THEN** the todo is removed from the list

### Requirement: Toggle all todos
The app SHALL display a "toggle all" checkbox when todos exist. Clicking it SHALL mark all todos as completed if any are active, or mark all as active if all are completed.

#### Scenario: Mark all as completed
- **WHEN** there are 3 todos (2 active, 1 completed) and user clicks "toggle all"
- **THEN** all 3 todos show as completed

#### Scenario: Mark all as active
- **WHEN** all todos are completed and user clicks "toggle all"
- **THEN** all todos show as active

### Requirement: Display active items count
The footer SHALL display the number of active (non-completed) todos with the text "{count} item(s) left". The count SHALL update reactively as items are added, removed, or toggled.

#### Scenario: Count updates on toggle
- **WHEN** there are 3 todos, 1 completed
- **THEN** the footer shows "2 items left"

#### Scenario: Singular form
- **WHEN** there is exactly 1 active todo
- **THEN** the footer shows "1 item left"

### Requirement: Filter todos by state
The footer SHALL display three filter links: "All", "Active", "Completed". Clicking a filter SHALL show only the matching todos. The selected filter SHALL be visually highlighted. The filter state SHALL be driven by the URL hash (`#/`, `#/active`, `#/completed`).

#### Scenario: Show only active todos
- **WHEN** user clicks the "Active" filter
- **THEN** only non-completed todos are visible and the URL hash is `#/active`

#### Scenario: Show only completed todos
- **WHEN** user clicks the "Completed" filter
- **THEN** only completed todos are visible and the URL hash is `#/completed`

#### Scenario: Default filter is "All"
- **WHEN** the page loads with no hash
- **THEN** all todos are visible and "All" filter is highlighted

### Requirement: Clear completed todos
The footer SHALL display a "Clear completed" button when any completed todos exist. Clicking it SHALL remove all completed todos from the list.

#### Scenario: Clear completed
- **WHEN** there are 2 completed and 1 active todo and user clicks "Clear completed"
- **THEN** only the 1 active todo remains

#### Scenario: Button hidden when none completed
- **WHEN** no todos are completed
- **THEN** the "Clear completed" button is not displayed

### Requirement: Hide main and footer when no todos
The main section (todo list + toggle all) and footer SHALL be hidden when there are zero todos.

#### Scenario: Empty state
- **WHEN** there are no todos
- **THEN** only the header with the input is visible

### Requirement: Use standard TodoMVC styling
The app SHALL use the `todomvc-app-css` stylesheet for all visual presentation. The HTML structure SHALL follow the TodoMVC template conventions (`.todoapp`, `.header`, `.main`, `.todo-list`, `.footer`, `.filters`).

#### Scenario: Standard structure
- **WHEN** the app is rendered
- **THEN** the DOM structure matches TodoMVC class conventions and the standard CSS is applied

### Requirement: Reactive state with signals
All mutable state SHALL be managed via `@hypeup/client` signals. The todo list SHALL be a `signal<Todo[]>`. Individual todo fields (title, completed) SHALL be signals for per-field granularity. Derived values (filtered list, active count, all-completed) SHALL use `computed`.

#### Scenario: Signal-driven reactivity
- **WHEN** user toggles a todo's completed state
- **THEN** the active count, filtered list, and toggle-all checkbox update without re-rendering unrelated DOM nodes

### Requirement: Build with Vite and @hypeup/plugin
The example SHALL be buildable and servable via Vite with `@hypeup/plugin/vite`. The DSL globals (element constructors, CSS properties, etc.) SHALL be transformed by the babel plugin at build time.

#### Scenario: Dev server works
- **WHEN** user runs the Vite dev server for the example
- **THEN** the TodoMVC app loads and functions in the browser
