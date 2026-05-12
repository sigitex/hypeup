## MODIFIED Requirements

### Requirement: Generate command renders pages to static files
The `generate` subcommand SHALL discover page components from the pages directory using the `**/*.{html,css,md}.*` pattern, render each to output using `@hypeup/render`, and write the output files to the output directory. The output format is determined by the file's target extension (html, css, md), not by the render pipeline — `render()` handles all formats uniformly.

#### Scenario: HTML page generation
- **WHEN** the user runs `hypeup generate` with a directory containing `index.html.ts` that default-exports a function returning content
- **THEN** the CLI SHALL write `dist/index.html` containing the rendered content

#### Scenario: CSS file generation
- **WHEN** the directory contains `styles.css.ts` that default-exports a function returning CSS rule nodes
- **THEN** the CLI SHALL write `dist/styles.css` containing the rendered CSS

#### Scenario: Markdown file generation
- **WHEN** the directory contains `readme.md.ts` that default-exports a function returning text content
- **THEN** the CLI SHALL write `dist/readme.md` containing the rendered content

#### Scenario: Nested pages
- **WHEN** the directory contains `blog/post.html.ts`
- **THEN** the CLI SHALL write `dist/blog/post.html` with the rendered content

#### Scenario: Mixed output formats
- **WHEN** the directory contains `index.html.ts`, `styles.css.ts`, and `readme.md.ts`
- **THEN** the CLI SHALL write `dist/index.html`, `dist/styles.css`, and `dist/readme.md`

### Requirement: Generate command reports results
The `generate` subcommand SHALL print a summary of generated files upon completion, including the number of files generated and the output directory path.

#### Scenario: Successful generation summary
- **WHEN** the `generate` command completes successfully with 5 files (3 html, 1 css, 1 md)
- **THEN** the CLI SHALL print a message indicating 5 files were generated and the output directory

#### Scenario: No pages found
- **WHEN** the pages directory contains no matching files
- **THEN** the CLI SHALL print a warning that no pages were found and exit with code 0
