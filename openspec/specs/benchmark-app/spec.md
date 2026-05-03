## ADDED Requirements

### Requirement: Benchmark page structure
The benchmark page SHALL include a jumbotron header with the title "hypeup-keyed", action buttons, a data table, and a glyphicon preload span. The page SHALL link to `/css/currentStyle.css` for Bootstrap styling.

#### Scenario: Page loads with correct structure
- **WHEN** the benchmark page is opened in a browser
- **THEN** the page SHALL contain a `div#main > div.container` with a `.jumbotron` header area and a `table.table.table-hover.table-striped.test-data` with a `tbody#tbody`

#### Scenario: Glyphicon preload present
- **WHEN** the page is loaded
- **THEN** the HTML SHALL contain `<span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>`

### Requirement: Action buttons with correct IDs
The page SHALL include six action buttons with specific IDs that the benchmark harness uses to trigger operations.

#### Scenario: All buttons present
- **WHEN** the page is loaded
- **THEN** the following buttons SHALL exist with these exact IDs: `run` (Create 1,000 rows), `runlots` (Create 10,000 rows), `add` (Append 1,000 rows), `update` (Update every 10th row), `clear` (Clear), `swaprows` (Swap Rows)

### Requirement: Create 1,000 rows
Clicking the `run` button SHALL clear any existing rows and create 1,000 new rows with incrementing IDs and random labels.

#### Scenario: Create rows from empty
- **WHEN** the `run` button is clicked with no existing rows
- **THEN** 1,000 rows SHALL appear in the table, each with a unique incrementing ID and a label of the form "{adjective} {color} {noun}"

#### Scenario: Create rows replaces existing
- **WHEN** the `run` button is clicked with existing rows in the table
- **THEN** all existing rows SHALL be removed and 1,000 new rows SHALL be created with new IDs (continuing the ID counter, not resetting)

### Requirement: Create 10,000 rows
Clicking the `runlots` button SHALL clear any existing rows and create 10,000 new rows.

#### Scenario: Create 10,000 rows
- **WHEN** the `runlots` button is clicked
- **THEN** 10,000 rows SHALL appear in the table with unique incrementing IDs

### Requirement: Append 1,000 rows
Clicking the `add` button SHALL append 1,000 new rows to the existing table without removing current rows.

#### Scenario: Append to existing rows
- **WHEN** 1,000 rows exist and the `add` button is clicked
- **THEN** the table SHALL contain 2,000 rows total, with the original 1,000 unchanged and 1,000 new rows appended

### Requirement: Update every 10th row
Clicking the `update` button SHALL append " !!!" to the label of every 10th row (indices 0, 10, 20, ...).

#### Scenario: Partial update
- **WHEN** 1,000 rows exist and the `update` button is clicked
- **THEN** rows at indices 0, 10, 20, ... SHALL have " !!!" appended to their labels
- **AND** all other rows SHALL remain unchanged

### Requirement: Clear rows
Clicking the `clear` button SHALL remove all rows from the table.

#### Scenario: Clear all rows
- **WHEN** rows exist and the `clear` button is clicked
- **THEN** the table SHALL be empty (zero rows)

### Requirement: Swap rows
Clicking the `swaprows` button SHALL swap the rows at positions 1 and 998 (0-indexed) in a table with at least 999 rows.

#### Scenario: Swap two rows
- **WHEN** 1,000 rows exist and the `swaprows` button is clicked
- **THEN** the row at position 1 SHALL move to position 998 and vice versa
- **AND** all other rows SHALL remain in their original positions

### Requirement: Select row
Clicking a row's label SHALL highlight that row with the `danger` CSS class and remove the highlight from any previously selected row.

#### Scenario: Select a row
- **WHEN** a row's label `<a>` is clicked
- **THEN** that row's `<tr>` SHALL have class `danger`
- **AND** any previously selected row SHALL have its `danger` class removed

### Requirement: Remove row
Clicking a row's remove icon SHALL remove that row from the table.

#### Scenario: Remove single row
- **WHEN** a row's remove glyphicon is clicked
- **THEN** that row SHALL be removed from the table
- **AND** all other rows SHALL remain unchanged

### Requirement: Row HTML structure
Each row SHALL conform to the exact HTML structure expected by the benchmark harness.

#### Scenario: Row structure matches reference
- **WHEN** a row is rendered
- **THEN** its HTML structure SHALL be: `<tr><td class="col-md-1">{id}</td><td class="col-md-4"><a>{label}</a></td><td class="col-md-1"><a><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td><td class="col-md-6"></td></tr>`

### Requirement: Keyed implementation
The implementation SHALL be keyed — each data item's ID SHALL map 1:1 to a DOM `<tr>` node. Reordering data SHALL reorder DOM nodes, not reuse them for different data.

#### Scenario: Passes isKeyed validation
- **WHEN** the benchmark's `npm run isKeyed keyed/hypeup` check is run
- **THEN** the implementation SHALL pass without errors

### Requirement: ID counter never resets
The data ID counter SHALL start at 1 and increment continuously. It SHALL NOT reset to 1 when creating new rows — only a full page reload resets the counter.

#### Scenario: IDs increment across operations
- **WHEN** `run` is clicked (creates IDs 1-1000), then `run` is clicked again
- **THEN** the second batch SHALL have IDs 1001-2000 (not 1-1000)
