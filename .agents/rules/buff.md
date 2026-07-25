# Buff Workflow Rules

When running `/buff` or `/buff-sync`:

- Use the `buff`, `forge-sync`, and `jerklint` skills.
- Do not archive the original OpenSpec change.
- No human approval gate after start.
- Run one complete buff pass per command invocation.
- A complete pass means all generated review findings are addressed, deduped, blocked, or explicitly deferred with a reason.
- Buff generates review material for the pass.
- Do not filter out jerklint structural/design findings because remediation is large.
- Every high/medium jerklint finding must be addressed, deduped, blocked, or deferred with a concrete reason before pass completion.
- When the original change is active, update that change's artifacts instead of creating follow-up changes.
- When the original change is archived or unavailable for editing, create one descriptive follow-up OpenSpec change. Do not use `<change-id>-buff-<n>` names.
- When the target is a path, scope reviews to that path and create one descriptive OpenSpec change. Default to local mode unless `--sync --pr <number>` is explicitly passed.
- Treat mode as explicit; do not ask git workflow questions.
- In sync mode, use the original PR only. If the original PR is unavailable, merged, closed, or cannot be identified, automatically fall back to local mode.
- Never create a new PR for buff sync.
- Persist state under `.ai/buff/<target-key>/state.md` after every completed step.
- Convert review findings into OpenSpec tasks before editing code: amend the original active change, or create one descriptive change when the original is archived/unavailable or the target is a path.
- Do not treat check, lint, or test output as review source.
- A completed pass must not leave buff-owned edits uncommitted.
- In local mode, commit completed verified buff work locally.
- If stopping with dirty buff-owned files, final response must list them and explain why they were not committed.
- Preserve unrelated user work in dirty worktrees.
