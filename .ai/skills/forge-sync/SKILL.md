---
name: forge-sync
description: Use for `--sync`, `/sketch-sync`, `/buff-sync`, or workflows needing shared local-vs-Forgejo git handling; centralizes branch, commit, push, PR, and Forgejo comment policy.
---

# Forge Sync

Forge Sync = shared git + Forgejo workflow policy. It decides how completed workflow units become commits, pushes, PRs, and PR comments. It does not decide when code work is complete.

## Inputs

Caller must provide or make clear:

- Mode: `local` or `sync`.
- Change ID.
- Workflow: `sketch`, `buff`, `archive`, or other.
- Unit: task section, buff pass, archive, or named completed work unit.
- Commit message.
- Optional PR comment body.

If mode is explicit, do not ask git workflow questions.

## Universal Rules

- Never force-push.
- Never delete branches.
- Never run destructive git commands.
- Never amend unless explicitly requested.
- Before committing, inspect status and diff.
- Do not include unrelated user changes.
- Commit messages must follow Conventional Commit and commitlint rules.

## Local Mode

Local mode means:

- Do not push.
- Do not create, update, or comment on PRs.
- Do not call Forgejo write tools.
- Create local commits only when caller requests a completed unit commit.
- For `Workflow: buff`, completed verified work must be committed locally.
- If unrelated changes exist, commit only files/hunks belonging to current unit.

## Sync Mode

Sync mode for non-buff workflows means:

- Ensure work happens on a feature branch for the change when caller has not already selected one.
- Commit completed unit.
- Push current branch after each unit commit.
- Create PR after first push if no PR exists.
- Reuse existing PR on later pushes.
- Add or update PR comment when caller provides comment body.

Default branch name when creating one:

```txt
feat/<change-id>
```

Default PR base:

```txt
main
```

Do not create duplicate PRs. Check branch/PR state first when feasible.

## Buff Sync Mode

Buff sync is stricter than normal sync:

- Discover the original PR and branch for the original OpenSpec change before editing.
- Use the original PR branch only.
- Never create a new PR for buff.
- If the original PR is open, commit and push buff work to that branch, then add or update the buff comment on that PR.
- If the original PR is missing, merged, closed, or cannot be identified, automatically return local fallback to the caller before edits begin.
- In local fallback, do not push, create PRs, or use Forgejo write tools; commit completed verified buff work locally.
- In path-sync mode (path target + `--sync --pr <number>`), treat the specified PR as the original PR. Push to that PR's branch only, comment on that PR only, never create a new PR, and return local fallback if the PR is closed, merged, missing, or cannot be identified.

## Checkpoint Procedure

When caller says a unit is complete:

1. Inspect git status and diff.
2. Stage only relevant files.
3. Commit with caller-provided message.
4. If mode is local, stop.
5. If mode is sync, push current branch.
6. If PR missing and workflow is not `buff`, create one.
7. If PR comment body provided, comment or update as directed by caller.
8. Report commit SHA, push status, PR URL/number, and comment status.

For `Workflow: buff`, replace steps 5-7 with Buff Sync Mode rules: push only to the original open PR branch, comment only on the original PR, and never create a PR.

## PR Comment Shape

Use caller-provided body when available. If caller asks for a default comment:

```md
## <Workflow> <Unit>

Change: `<change-id>`

Commits:
- `<sha>` <subject>

Verification:
- <summary>
```
