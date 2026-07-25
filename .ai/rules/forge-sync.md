# Forge Sync Rules

When a workflow uses explicit mode:

- `Mode: sync` or `--sync` means sync mode.
- no sync marker means local mode.
- Do not ask whether git workflow should be agent-managed.

Local mode:
- No push.
- No Forgejo write tools.
- No PR create/update/comment.
- For buff, completed verified work is still committed locally.

Sync mode, except buff:
- Commit completed workflow units.
- Push after each unit commit.
- For non-buff workflows, create PR after first push if missing.
- Reuse existing PR on later pushes.
- Comment/update PR only when workflow asks for it.

Buff sync exception:
- Use the original PR only.
- For path-sync (`--sync --pr <number>`), treat the specified PR as the original PR.
- Never create a new PR for buff sync.
- If the original PR is unavailable, merged, closed, or cannot be identified, automatically fall back to local mode before edits.
- In local fallback, do not push or use Forgejo write tools; commit completed verified buff work locally.

Forbidden always:
- No force push.
- No branch deletion.
- No hard reset.
- No amending unless explicitly requested.
