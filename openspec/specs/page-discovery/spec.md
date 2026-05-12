## ADDED Requirements

### Requirement: Discover page files by glob pattern
The page discovery system SHALL scan the pages directory for files matching `**/*.{html,css,md}.*` — files with an allowlisted target format as the middle extension and any source extension. Only `html`, `css`, and `md` are recognized as target formats.

#### Scenario: HTML file discovered
- **WHEN** the pages directory contains `index.html.ts`
- **THEN** discovery SHALL return the file path

#### Scenario: CSS file discovered
- **WHEN** the pages directory contains `styles.css.ts`
- **THEN** discovery SHALL return the file path

#### Scenario: Markdown file discovered
- **WHEN** the pages directory contains `readme.md.ts`
- **THEN** discovery SHALL return the file path

#### Scenario: Non-standard source extension discovered
- **WHEN** the pages directory contains `index.html.civet`
- **THEN** discovery SHALL return the file path (source extension is a wildcard)

#### Scenario: Nested directories
- **WHEN** the pages directory contains `blog/index.html.ts` and `blog/styles.css.ts`
- **THEN** discovery SHALL return both file paths

#### Scenario: Non-allowlisted target format ignored
- **WHEN** the pages directory contains `data.json.ts`
- **THEN** discovery SHALL NOT return the file path

#### Scenario: Single-extension files ignored
- **WHEN** the pages directory contains `helpers.ts` or `utils.js`
- **THEN** discovery SHALL NOT return those file paths

#### Scenario: Old .page.ts convention ignored
- **WHEN** the pages directory contains `index.page.ts`
- **THEN** discovery SHALL NOT return the file path

#### Scenario: Empty pages directory
- **WHEN** the pages directory contains no matching files
- **THEN** discovery SHALL return an empty list

### Requirement: Exclude non-page files
The page discovery system SHALL exclude files whose names start with `_` (underscore) or `.` (dot). These are treated as internal/helper modules, not pages.

#### Scenario: Underscore-prefixed files are excluded
- **WHEN** the pages directory contains `index.html.ts` and `_layout.html.ts`
- **THEN** discovery SHALL return only `index.html.ts`

#### Scenario: Dot-prefixed files are excluded
- **WHEN** the pages directory contains `index.html.ts` and `.hidden.html.ts`
- **THEN** discovery SHALL return only `index.html.ts`

### Requirement: Map file paths to output routes
The page discovery system SHALL map each discovered file path to an output route by stripping the final (source) extension. The output route is the filename without the source extension.

#### Scenario: HTML route
- **WHEN** a page file is at `index.html.ts`
- **THEN** the output route SHALL be `index.html`

#### Scenario: CSS route
- **WHEN** a page file is at `styles.css.ts`
- **THEN** the output route SHALL be `styles.css`

#### Scenario: Nested route
- **WHEN** a page file is at `blog/post.html.ts`
- **THEN** the output route SHALL be `blog/post.html`

#### Scenario: Markdown file route
- **WHEN** a page file is at `docs/readme.md.ts`
- **THEN** the output route SHALL be `docs/readme.md`

#### Scenario: Civet source extension stripped
- **WHEN** a page file is at `index.html.civet`
- **THEN** the output route SHALL be `index.html`

#### Scenario: Dynamic route with params
- **WHEN** a page file is at `blog/[slug].html.ts`
- **THEN** the output route SHALL be `blog/[slug].html`

### Requirement: Validate pages directory exists
The page discovery system SHALL verify that the pages directory exists before scanning. If the directory does not exist, it SHALL throw an error with a descriptive message.

#### Scenario: Pages directory does not exist
- **WHEN** the specified pages directory path does not exist on the filesystem
- **THEN** discovery SHALL throw an error stating the pages directory was not found

#### Scenario: Pages directory is a file
- **WHEN** the specified pages directory path is a file instead of a directory
- **THEN** discovery SHALL throw an error stating the pages path is not a directory
