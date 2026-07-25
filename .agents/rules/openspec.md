# OpenSpec Instructions

## OpenSpec Propose Workflow

When proposing changes via `/opsx-propose`:

- If the change introduces or modifies user-facing behavior (API changes, conventions), include a task section for updating `README.md` in the proposal's impact assessment.

## OpenSpec Archive Workflow

When archiving tasks via `/opsx-archive`:

1. Check for `.ai/buff/<change-id>/state.md`; if present, include completed buff artifacts as one archive unit.
2. Automatically sync specs, do not ask the user.
3. If mode is explicit, use `forge-sync` for archive commit, push, PR, and Forgejo behavior.
4. If no mode is explicit, default to local mode.

## OpenSpec Archive With Buff Artifacts

When archiving an original change with `.ai/buff/<change-id>/state.md`:

- Treat the original change and all completed buff artifacts as one archive unit.
- Read buff state before syncing specs.
- Use `OpenSpec Artifacts` from buff state as the ordered list of candidate buff artifacts.
- Include only artifacts whose findings/groups are completed, addressed, or deduped.
- Do not archive artifacts tied only to blocked, deferred, or incomplete findings/groups.
- Sync specs for the original change and included buff artifacts in state order.
- Archive all included changes in the same archive workflow invocation and commit.
- Preserve blocked/deferred findings in buff state and mention them in the archive summary.
- In sync mode, use one `forge-sync` checkpoint for the combined archive unit.
