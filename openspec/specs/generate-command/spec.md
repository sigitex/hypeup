## ADDED Requirements

### Requirement: Generate command renders pages to static HTML files
The `generate` subcommand SHALL discover page components from the pages directory, render each to a complete HTML document using `@hypeup/render`, and write the output files to the output directory.

#### Scenario: Basic generation
- **WHEN** the user runs `hypeup generate` with a `pages/` directory containing `index.tsx` that default-exports a function returning vdom content
- **THEN** the CLI SHALL write `dist/index.html` containing a complete HTML document with the rendered content

#### Scenario: Nested pages
- **WHEN** the pages directory contains `blog/post.tsx`
- **THEN** the CLI SHALL write `dist/blog/post.html` with the rendered content

### Requirement: Generate command accepts output directory option
The `generate` subcommand SHALL accept a `--out` flag to specify the output directory. The default output directory SHALL be `dist`.

#### Scenario: Custom output directory
- **WHEN** the user runs `hypeup generate --out build`
- **THEN** the CLI SHALL write generated HTML files to the `build/` directory instead of `dist/`

#### Scenario: Default output directory
- **WHEN** the user runs `hypeup generate` without `--out`
- **THEN** the CLI SHALL write generated HTML files to the `dist/` directory

### Requirement: Generate command accepts pages directory option
The `generate` subcommand SHALL accept a `--pages` flag to specify the source pages directory. The default pages directory SHALL be `pages`.

#### Scenario: Custom pages directory
- **WHEN** the user runs `hypeup generate --pages src/routes`
- **THEN** the CLI SHALL discover page components from `src/routes/` instead of `pages/`

### Requirement: Generate command accepts base path option
The `generate` subcommand SHALL accept a `--base` flag to specify a base path prefix. The default base path SHALL be `"/"`.

#### Scenario: Base path is provided
- **WHEN** the user runs `hypeup generate --base /app`
- **THEN** the CLI SHALL make the base path available to page components during rendering

### Requirement: Generate command supports clean option
The `generate` subcommand SHALL accept a `--clean` flag. When set, the output directory SHALL be removed before generating new files.

#### Scenario: Clean flag removes output directory
- **WHEN** the user runs `hypeup generate --clean` and the output directory already exists with stale files
- **THEN** the CLI SHALL remove the output directory and its contents before writing new files

#### Scenario: Clean flag with empty output
- **WHEN** the user runs `hypeup generate --clean` and the output directory does not exist
- **THEN** the CLI SHALL proceed without error

### Requirement: Generate command wraps content in HTML document
The `generate` subcommand SHALL wrap each page's rendered content in a complete HTML5 document structure including `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>` tags.

#### Scenario: Default document wrapper
- **WHEN** a page default-exports a function returning vdom content and does not export a `head` function
- **THEN** the output HTML SHALL contain `<!DOCTYPE html>`, a `<head>` with a default `<meta charset="utf-8">`, and a `<body>` wrapping the rendered content

#### Scenario: Custom head export
- **WHEN** a page exports a `head` function alongside the default export that returns vdom content for the head
- **THEN** the output HTML SHALL include the rendered head content inside the `<head>` tag

### Requirement: Generate command reports results
The `generate` subcommand SHALL print a summary of generated files upon completion, including the number of pages generated and the output directory path.

#### Scenario: Successful generation summary
- **WHEN** the `generate` command completes successfully with 3 pages
- **THEN** the CLI SHALL print a message indicating 3 pages were generated and the output directory

#### Scenario: No pages found
- **WHEN** the pages directory contains no page files
- **THEN** the CLI SHALL print a warning that no pages were found and exit with code 0

### Requirement: Generate command exits with error on render failure
The `generate` subcommand SHALL exit with code 1 if any page fails to render, printing the file path and error message.

#### Scenario: Page render error
- **WHEN** a page component throws an error during rendering
- **THEN** the CLI SHALL print the file path and error message to stderr and exit with code 1
