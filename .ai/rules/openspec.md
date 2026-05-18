# OpenSpec Instructions

## OpenSpec Propose Workflow

When proposing changes via /opsx-propose:

- If the change introduces or modifies user-facing behavior (API changes, conventions), include a task section for updating `README.md` in the proposal's impact assessment.

## OpenSpec Apply Workflow

When implementing tasks via /opsx-apply:

1. Before starting tasks, create and checkout a `feat/<change-name>` branch. If it already exists (resuming work), just check it out.
2. After completing each task **section** (numbered group in tasks.md): `git add -A && git commit -m "feat(<change-name>): <task description>" && git push origin -u feat/<change-name>`. **Do NOT batch sections into a single commit. Each section gets its own commit and push immediately after completion.**
3. After the **first** push only: create a pull request on Forgejo using the qbcode MCP tool (`mcp__oc__qbcode_create_pull_request`) with owner: `sigitex`, repo: `hypeup`, base: `main`, head: `feat/<change-name>`, title: `<change-name>`, body: proposal summary. **Do this immediately after the first push, not at the end.** Skip PR creation on subsequent pushes.

## OpenSpec Archive Workflow

When archiving tasks via /opsx-archive:

1. Automatically sync specs, do not ask the user.
2. After completing the archive, if the PR hasn't already been merged (check), `git add -A && git commit -m "chore(<change-name>"): archive change" && git push origin feat/<change-name>`
