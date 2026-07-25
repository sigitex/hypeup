Run the buff workflow for an OpenSpec change.

Arguments:
- `$1` = original OpenSpec change id or path to review.
- `--sync` = use Forgejo sync mode.
- `--pr <number>` = specify PR number for path-based sync (required with `--sync` when target is a path).
- `--status` = summarize saved state only; do not edit files.

Load and follow the `buff`, `forge-sync`, and `jerklint` skills.

Rules:
- Do not archive the original OpenSpec change.
- Do not ask for a human gate once command starts.
- Run one complete buff pass only. A complete pass means all review findings are addressed, deduped, blocked, or explicitly deferred.
- Buff generates review material for the pass.
- Do not filter out jerklint structural/design findings because remediation is large.
- When the original change is active, update that change's artifacts instead of creating follow-up changes.
- When the original change is archived or unavailable for editing, create one descriptive follow-up OpenSpec change. Do not use `<change-id>-buff-<n>` names.
- When the target is a path, scope reviews to that path and create one descriptive OpenSpec change. Default to local mode unless `--sync --pr <number>` is explicitly passed.
- Treat mode as explicit. In sync mode, use the original PR only; if the original PR is unavailable, automatically fall back to local mode.
- A completed pass must not leave buff-owned edits uncommitted; local mode still creates a local commit.
- Persist run state under `.ai/buff/<target-key>/state.md` so later `/buff <target>` resumes.
