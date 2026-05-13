# hypeup

The purple dog is named Cletus.

## Design constraints

- Avoiding needing to `import` any of the DSL primitives. This includes HTML elements, CSS properties, basics like `on`, `each`, and `reactive` - things that will be used in markup.

## Code generation

The `packages/lexicon` package contains generated files (`css.gen.ts`, `html.gen.ts`, `primitives.gen.ts`). To regenerate them, run `bun run generate` **in `packages/lexicon`** — not in `packages/generate` directly. The generate script writes output relative to the lexicon package's working directory.

## Repository structure

Packages have been moved from the top level into `packages/`. The workspace glob in `package.json` reflects this. When referencing package source paths, use `packages/<name>/src/...` not `<name>/src/...`. Archived openspec changes still use old top-level paths — that is intentional and should not be updated.

## OpenSpec Propose Workflow

When proposing changes via /opsx-propose:

- If the change introduces or modifies user-facing behavior (API changes, conventions), include a task section for updating `README.md` in the proposal's impact assessment.

## OpenSpec Apply Workflow

When implementing tasks via /opsx-apply:

1. Before starting tasks, create and checkout a `feat/<change-name>` branch. If it already exists (resuming work), just check it out.
2. After completing each task **section** (numbered group in tasks.md): `git add -A && git commit -m "feat(<change-name>): <task description>" && git push origin -u feat/<change-name>`.
3. After the first push only: create a pull request on Forgejo using the qbcode MCP tool (`mcp__oc__qbcode_create_pull_request`) with owner: `sigitex`, repo: `hypeup`, base: `main`, head: `feat/<change-name>`, title: `<change-name>`, body: proposal summary. Skip PR creation on subsequent pushes.

## OpenSpec Archive Workflow

When archiving tasks via /opsx-archive:

1. Automatically sync specs, do not ask the user.
2. After completing the archive, `git add -A && git commit -m "chore(<change-name>"): archive change" && git push origin feat/<change-name>`
