## 1. Repo Setup

- [x] 1.1 Clone `krausest/js-framework-benchmark` to `/sig/hypeup-bench`
- [x] 1.2 Run `npm ci` in the repo root to install benchmark dependencies
- [x] 1.3 Create `frameworks/keyed/hypeup/` directory

## 2. Project Scaffolding

- [x] 2.1 Create `frameworks/keyed/hypeup/package.json` with `js-framework-benchmark` metadata, dependencies (`@hypeup/client`, `@hypeup/vdom`, `@hypeup/plugin` via file paths to `/sig/hypeup`, `vite`), and `build-prod` script
- [x] 2.2 Create `frameworks/keyed/hypeup/vite.config.ts` with `@hypeup/plugin` configured
- [x] 2.3 Create `frameworks/keyed/hypeup/index.html` with correct page structure: `div#main > div.container`, jumbotron, table, Bootstrap CSS link (`/css/currentStyle.css`), glyphicon preload span

## 3. Data Store

- [x] 3.1 Create `frameworks/keyed/hypeup/src/store.ts` with reactive state (`data` array, `selected` ID, `id` counter)
- [x] 3.2 Implement `buildData(count)` — generates rows with incrementing IDs and random "{adjective} {color} {noun}" labels
- [x] 3.3 Implement store operations: `run()` (create 1,000), `runLots()` (create 10,000), `add()` (append 1,000), `update()` (every 10th label += " !!!"), `clear()`, `swapRows()` (swap indices 1 and 998), `select(id)`, `remove(id)`

## 4. Benchmark UI

- [x] 4.1 Create `frameworks/keyed/hypeup/src/main.ts` — the app entry point
- [x] 4.2 Implement the jumbotron header with title "hypeup-keyed" and 6 action buttons using hypeup DSL, with correct button IDs (`run`, `runlots`, `add`, `update`, `clear`, `swaprows`)
- [x] 4.3 Wire button click events to store operations via `on("click", ...)`
- [x] 4.4 Implement row rendering via `each(state.data, d => d.id, d => tr(...))` with correct `<tr>` structure: 4 `<td>` cells (ID, label link, remove icon, empty)
- [x] 4.5 Implement row selection: `danger` class on `<tr>` reactive to `state.selected === d.id`
- [x] 4.6 Wire row label click to `select(d.id)` and remove icon click to `remove(d.id)`
- [x] 4.7 Mount the app into `document.getElementById("main")`

## 5. Build & Verify

- [x] 5.1 Run `npm ci` then `npm run build-prod` in `frameworks/keyed/hypeup/` and verify it completes without errors
- [x] 5.2 Verify no `.gz` files in output directory
- [x] 5.3 Start benchmark server (`npm start` from repo root), open `http://localhost:8080/frameworks/keyed/hypeup/` and verify page loads
- [x] 5.4 Manually test all operations: run, runlots, add, update, clear, swaprows, select, remove
- [x] 5.5 Verify row HTML structure matches reference (inspect DOM for correct classes, `aria-hidden`, cell structure)
- [x] 5.6 Verify IDs increment across operations (never reset)
- [x] 5.7 Run `npm run isKeyed keyed/hypeup` from `webdriver-ts/` to validate keyed correctness
