---
name: buff
description: Use for `/buff` and `/buff-sync`: single-pass autonomous review-remediation for an already-applied OpenSpec change, with optional Forgejo sync via `forge-sync` and resumable state.
---

# Buff

Buff = single autonomous review-remediation pass after OpenSpec apply or over a path. It generates reviews, normalizes all findings, updates the original active change artifacts, applies each group one by one, verifies, checkpoints, then stops. If the original change is archived/unavailable, or if the target is a path, buff creates one descriptive OpenSpec change instead.

## Non-Negotiables

- Do not archive the original OpenSpec change.
- Do not ask for human gate after command starts.
- Run one complete buff pass per command invocation.
- A complete pass means every generated finding is addressed, deduped, blocked, or explicitly deferred with a reason.
- Use `forge-sync` for all commit, push, PR, and Forgejo behavior.
- Load and follow the `jerklint` skill for buff review generation.
- Buff generates review material for the pass.
- Do not filter out jerklint structural/design findings because remediation is large.
- When the original change is active, update that change's artifacts instead of creating follow-up changes.
- When the original change is archived or unavailable for editing, create one descriptive follow-up OpenSpec change. Do not use `<change-id>-buff-<n>` names.
- When the target is a path, scope reviews to that path and create one descriptive OpenSpec change. Default to local mode unless `--sync --pr <number>` is explicitly passed.
- A completed pass must not leave buff-owned edits uncommitted; local mode still creates a local commit.
- Do not overwrite user/unrelated changes.
- Persist state after every completed step.

## Inputs

Parse command text:

- Target: first positional arg. It may be an OpenSpec change id or a filesystem path.
- Mode:
  - `Mode: sync` or `--sync` -> sync mode.
  - existing incomplete state with `Mode: sync` -> sync mode.
  - otherwise local mode.
- `--pr <number>` specifies the PR for path-based sync. It is required when using `--sync` with a path target. Ignore it in change mode; change mode discovers its own PR.
- `--status` reports state and exits without edits.

If target missing, ask one concise question for it.

## State

State path:

```txt
.ai/buff/<target-key>/state.md
```

Pass paths:

```txt
.ai/buff/<target-key>/pass-<n>/reviews.md
.ai/buff/<target-key>/pass-<n>/findings.md
.ai/buff/<target-key>/pass-<n>/groups.md
.ai/buff/<target-key>/pass-<n>/verification.md
```

State template:

```md
Target: <change-id-or-path>
Target Type: change|path
Review Scope: <path-or-change-id>
State Key: <change-id-or-sanitized-path>
Original Change: <change-id-or-none>
Original Change Status: active|archived|unavailable
Artifact Mode: amend-original|follow-up
Current Artifact: <change-id-or-follow-up-id>
Requested Mode: local|sync
Effective Mode: local|sync
Status: <status>
Current Pass: <n>
Original Branch: <branch-or-none>
Original PR: <number-or-none>
Specified PR: <number-or-none>
Current Group: <group-id-or-none>
OpenSpec Artifacts: <change-ids>
Addressed Findings: <ids>
Deduped Findings: <ids>
Blocked Findings: <ids-and-reasons>
Deferred Findings: <ids-and-reasons>
Checkpoint: pending|committed|pushed|local-fallback
Last Completed Step: <step>
Next Step: <step>
Updated: <iso8601>
```

Step names:

- initialized
- reviewed
- findings-normalized
- grouped
- original-artifacts-updated
- group-change-created
- group-applied
- group-verified
- verified
- checkpointed
- pass-complete
- stopped

State file is workflow source of position. Git/worktree is source of code truth. On resume, read both and reconcile before continuing.

If state exists with incomplete pass, resume that pass. If state exists and last pass completed, start next pass number. If no state exists, start pass 1.

## Workflow

1. Load args and existing state.
2. Resolve the target. If the target contains `/` or resolves to an existing filesystem path, use path mode. Otherwise, use change mode. For path mode, derive `State Key` by replacing non-alphanumeric path separators with `-`.
3. In path mode, set `Target Type: path`, `Review Scope: <path>`, and `Artifact Mode: follow-up`. If `--sync` is passed without `--pr <number>`, stop with an error before editing. If `--sync --pr <number>` is passed, set effective mode to `sync`, record the specified PR as `Specified PR` and `Original PR`, and identify its branch. If the specified PR is missing, merged, or closed, automatically fall back to local before editing. Otherwise set effective mode to `local`. Path-sync uses the specified PR only; never create a new PR.
4. In change mode, locate original change at `openspec/changes/<change-id>`. If active, set artifact mode to `amend-original`.
5. If the original change is archived or unavailable for editing, use it only as context and set artifact mode to `follow-up`. Do not unarchive or edit archived artifacts.
6. In change sync mode, ask `forge-sync` to identify the original PR/branch. If unavailable, merged, closed, or unidentified, automatically switch effective mode to local before editing.
7. Inspect git branch/status/diff. Preserve unrelated changes.
8. Initialize, resume, or advance to one current pass.
9. Run review agents for code review and jerklint/design pressure scoped to `Review Scope`. Load `jerklint` and use its full axes for the jerklint review. Do not prompt jerklint with "no broad rewrites", "smallest fixes only", or equivalent filters. Save generated reviews to `pass-<n>/reviews.md`.
10. Normalize all actionable findings into `pass-<n>/findings.md`.
11. Dedupe overlapping findings. Group remaining findings by coherent implementation boundary. Save groups to `pass-<n>/groups.md`.
12. If no actionable findings remain, mark pass complete and stop.
13. If artifact mode is `amend-original`, add or update `## Buff Pass <n>` in the original change's `tasks.md` with grouped findings and remediation tasks. Update proposal/design/spec deltas only when remediation changes behavior, API, docs, intent, or tradeoffs.
14. If artifact mode is `follow-up`, create one descriptive follow-up OpenSpec change for the pass. Create multiple follow-up changes only when groups are too independent or large for one coherent change.
15. For each group, apply it autonomously, verify relevant checks, update artifacts/state, then continue to the next group.
16. Mark each finding as addressed, deduped, blocked, or deferred with reason. Do not silently drop broad refactor/design findings. Every high/medium jerklint finding must be accounted for explicitly.
17. Run final verification for the whole pass and write `verification.md`.
18. Run `forge-sync` checkpoint for the completed buff pass using the effective mode. Completed verified buff work must be committed locally even when effective mode is local.
19. Mark pass complete and stop.
20. Report final status, files changed, commits, sync/local fallback result, verification, and stop reason.

## Review Input

Buff-generated reviews are the source of findings.

- Standard code review using the mandatory review axes below.
- `jerklint` for design/code-quality pressure using the full jerklint axes.
- Jerklint findings must include structural/design problems when present, even if remediation is broad.

Review agents must produce structured findings using the scenario table format in "Findings Format" below. Prose-only findings without scenario/expected/actual tracing are rejected.

Do not use `check`, `lint`, or `test` output as review sources. Main OpenSpec apply owns those checks. Buff may record verification results after remediation, but verification output is not itself a review source.

## Review Axes (mandatory)

Review agents must cover every axis. Each axis produces zero or more findings.

- Validation completeness: For every user-facing metadata/config field, enumerate what values are accepted. Check empty, duplicate, negative, fractional, conflicting, and missing values. Flag any invalid value that silently succeeds.
- Configuration error detection: Check every Map/Set/object keyed by user metadata for collision risk. Check every metadata whitelist and blocklist for missing entries. Flag misconfigurations that produce late or misleading errors instead of fast, specific rejections.
- Entry point shape coverage: For each public API entry point, mentally test minimal config, maximal config, and degenerate config (e.g. root-only, nested-only, mixed, empty). Flag any config shape that produces wrong behavior, wrong help, or wrong errors.
- Help and output correctness: Check that help text, error messages, and formatted output are correct for every distinct shape the API supports (e.g. root command, nested command, aliased command, hidden command, no-input, no-output). Flag any shape where output is wrong, misleading, or missing.
- Error path tracing: Enumerate every user-facing error return or throw. Verify each produces the correct message for the correct condition. Flag error paths that swallow context, misreport cause, or are unreachable.
- Data flow preservation: Trace user config through each construction/normalization phase. Flag any phase that drops, ignores, or silently rewrites user-provided metadata that downstream consumers expect to be preserved.

## Findings Format

Write findings using this exact shape:

```md
## Finding <n>

Severity: blocker|high|medium|low
Source: review|jerklint
File: <path-or-none>
Line: <line-or-none>
Scenario: <specific input, config, or call that triggers the problem>
Expected: <what should happen under that scenario>
Actual: <what does happen, with code evidence>
Claim: <one-line summary of the problem>
Suggested OpenSpec Change: <coherent remediation change>
```

The `Scenario → Expected → Actual` triple is mandatory. It forces concrete case tracing rather than pattern-matching. A finding without a specific triggering scenario is too vague to act on.

Only include actionable findings. High/medium jerklint findings are actionable unless impossible, duplicate, blocked, or explicitly deferred with a concrete reason. Do not defer a finding only because it is large; the deferral reason must explain why it is unsafe or out of scope for this pass and suggest a descriptive future change ID. Dedupe repeated findings across sources.

## Finding Groups

Write groups to `groups.md` using this shape:

```md
## Group <descriptive-change-id>

Findings: <ids>
Rationale: <why these findings should be fixed together>
Status: pending|applied|verified|blocked|deferred
```

Group by implementation boundary, not by severity. In `amend-original` mode, groups become sections under the original change's buff pass tasks. In `follow-up` mode, groups are covered by one descriptive follow-up change unless they are too independent or large for one coherent change.

## Original Change Artifacts

When artifact mode is `amend-original`:

- Update `openspec/changes/<change-id>/tasks.md` with `## Buff Pass <n>`.
- Add grouped remediation tasks under the buff pass section.
- Update existing proposal/design/spec deltas only when remediation changes behavior, API, docs, intent, or tradeoffs.
- Do not create follow-up OpenSpec changes.
- Keep `.ai/buff/<target-key>/` as execution state, not source-of-truth requirements.

## Follow-Up OpenSpec Change

Use a follow-up change only when the original change is archived or unavailable for editing, or when the target is a path.

Path mode always uses one descriptive OpenSpec change because there is no original change artifact to amend.

Name:

```txt
<descriptive-change-id>
```

Examples:

```txt
cli-validate-command-options
cli-render-root-command-help
cli-preserve-root-operation-config
cli-reduce-parser-duplication
```

Required files:

```txt
openspec/changes/<followup>/proposal.md
openspec/changes/<followup>/tasks.md
```

Add spec deltas only when behavior/API/docs requirements change. Avoid spec churn for purely internal cleanup.

Proposal must cite source finding ids. Tasks must be grouped so commits can follow task sections. Do not create `<change-id>-buff-<n>` changes.

## Checkpoint Invariant

Buff must not finish a completed pass with uncommitted buff-owned changes.

- In local mode, commit completed verified buff work locally.
- In sync mode, commit completed verified buff work, then push/comment according to sync rules.
- If verification fails or work is blocked, do not commit partial work unless the current group is complete and verified.
- If stopping with dirty buff-owned files, final response must list them and explain why they were not committed.
- Never commit unrelated user changes.

## Forge Sync Checkpoint

When pass work is complete, call `forge-sync` with:

- Mode: buff mode.
- Change ID: original change id for change mode, or state key for path mode.
- Workflow: `buff`.
- Unit: `pass <n>`.
- Commit message: `fix(<change-id>): address buff review findings` unless a more specific Conventional Commit type is clearly better.
- PR comment body summarizing OpenSpec artifacts, findings addressed/deduped/blocked/deferred, verification, and commits.

For path-sync, pass `Specified PR` to `forge-sync` and treat it as the original PR. Never create a PR for path-sync.

PR comment body:

```md
## Buff Pass <n>

OpenSpec artifacts:
- `<change-id-or-descriptive-follow-up-id>`

Reviews run:
- generated review agents

Findings addressed:
- Finding <n>: <claim>

Findings deferred:
- Finding <n>: <reason>

Verification:
- <command>: pass|fail|missing

Commits:
- `<sha>` <subject>
```

## Stop Conditions

Stop when:

- no actionable findings remain.
- one complete buff pass finishes with all findings addressed, deduped, blocked, or deferred.
- verification fails and no clear fix exists inside the current group.
- dirty worktree contains conflicting unrelated changes.

Do not mark a pass complete until every high/medium jerklint finding is addressed, deduped, blocked, or deferred with a concrete reason.

Always write final state before stopping.

## Final Response

Report:

- mode
- effective mode and sync fallback reason if any
- target type and review scope
- stop reason
- pass number
- OpenSpec artifacts updated or created
- findings addressed/deduped/blocked/deferred
- commits made
- dirty buff-owned files and reason when stopping before commit
- sync/PR result if sync mode
- verification commands and status
