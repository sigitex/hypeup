## ADDED Requirements

### Requirement: Discover page files by glob pattern
The page discovery system SHALL scan the pages directory for files matching `**/*.{ts,tsx}` and return a list of discovered page file paths.

#### Scenario: Flat pages directory
- **WHEN** the pages directory contains `index.tsx`, `about.tsx`, and `contact.ts`
- **THEN** discovery SHALL return all three file paths

#### Scenario: Nested directories
- **WHEN** the pages directory contains `index.tsx`, `blog/index.tsx`, and `blog/post.tsx`
- **THEN** discovery SHALL return all three file paths including nested ones

#### Scenario: Empty pages directory
- **WHEN** the pages directory contains no `.ts` or `.tsx` files
- **THEN** discovery SHALL return an empty list

### Requirement: Exclude non-page files
The page discovery system SHALL exclude files whose names start with `_` (underscore) or `.` (dot). These are treated as internal/helper modules, not pages.

#### Scenario: Underscore-prefixed files are excluded
- **WHEN** the pages directory contains `index.tsx` and `_layout.tsx`
- **THEN** discovery SHALL return only `index.tsx`

#### Scenario: Dot-prefixed files are excluded
- **WHEN** the pages directory contains `index.tsx` and `.hidden.ts`
- **THEN** discovery SHALL return only `index.tsx`

### Requirement: Map file paths to output routes
The page discovery system SHALL map each discovered file path to an output HTML path relative to the output directory. The mapping SHALL strip the file extension and append `.html`.

#### Scenario: Top-level page
- **WHEN** a page file is at `pages/about.tsx`
- **THEN** the output route SHALL be `about.html`

#### Scenario: Index page
- **WHEN** a page file is at `pages/index.tsx`
- **THEN** the output route SHALL be `index.html`

#### Scenario: Nested page
- **WHEN** a page file is at `pages/blog/post.tsx`
- **THEN** the output route SHALL be `blog/post.html`

#### Scenario: Nested index page
- **WHEN** a page file is at `pages/blog/index.tsx`
- **THEN** the output route SHALL be `blog/index.html`

### Requirement: Validate pages directory exists
The page discovery system SHALL verify that the pages directory exists before scanning. If the directory does not exist, it SHALL throw an error with a descriptive message.

#### Scenario: Pages directory does not exist
- **WHEN** the specified pages directory path does not exist on the filesystem
- **THEN** discovery SHALL throw an error stating the pages directory was not found

#### Scenario: Pages directory is a file
- **WHEN** the specified pages directory path is a file instead of a directory
- **THEN** discovery SHALL throw an error stating the pages path is not a directory
