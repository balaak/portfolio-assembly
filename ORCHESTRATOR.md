# ORCHESTRATOR.md — Claude/Blake issue-driven loop

Autonomous, **review-gated** loop that turns routed GitHub issues into merged PRs
on `balaak/portfolio-assembly`. Companion to `AGENTS.md` (which governs *how* the
code change is made); this file governs *how the work moves through the board*.

---

## Board

- Kanban = **GitHub Projects v2**, project #3, owner `balaak`.
  URL: https://github.com/users/balaak/projects/3
  Project node ID: `PVT_kwHOAMHvb84BdEpe`
  Status field ID: `PVTSSF_lAHOAMHvb84BdEpezhXo3qE`
- Status column IDs:
  | Column | Option ID |
  |---|---|
  | Backlog | `f75ad846` |
  | Ready | `61e4505c` |
  | In progress | `47fc9ee4` |
  | In review | `df73e18b` |
  | Done | `98236657` |
- **`project`/`read:project` scope is granted on BOTH gh accounts, but the project node ID
  only resolves under `balaak`.** Run `gh auth switch --user balaak` before any
  `gh project` command — under the default active account (`bala91px`) board calls fail
  with NOT_FOUND. Repo issue create/edit works from either account.
- `status:in-progress` / `status:in-review` repo labels are kept as a secondary,
  human-scannable mirror on the issue itself, but the **board Status field is
  the source of truth** for column position.

## Routing & priority — these are Bala's signals, not mine to assume

- I pick up an issue **only** if it is OPEN, labeled **`agent-ready` + `claude`**,
  and **not** `needs-bala`.
- I **never** touch a `codex`-labeled issue (another agent owns it).
- Priority order: **`p0` → `p1` → `p2`**. Tie-break: lowest issue number.
- New issues auto-land in **Backlog**. An issue is promoted to **Ready** only once it is
  scoped tightly enough to execute with no further questions AND is not `needs-bala`.
  The `status:ready` repo label mirrors this column.
- Domain labels map to the reference I must read before building:
  - `motion` → `DESIGN.md` §3 — **no new animation/easing without Bala's OK in the issue thread**
  - `content` → `CONTENT-TRUTH.md` must back any real fact; if it's missing, **flag it, never invent**
  - `design` / `build` → `DESIGN.md` §2 tokens + §4 section architecture
  - any other custom project tag Bala defines → read its mapped doc first; if unmapped, **ask**

## State machine — one task at a time

1. **SELECT** the highest-priority actionable issue (board status Backlog or
   Ready; label `agent-ready` + `claude`; not `needs-bala`).
   If any of my issues is already at board status **In review**, **STOP** —
   wait for Bala, do not start new work (never run two tasks at once, never
   collide with Codex).
2. **CLAIM**: move the board item's Status → **In progress**
   (`gh project item-edit --project-id PVT_kwHOAMHvb84BdEpe --field-id PVTSSF_lAHOAMHvb84BdEpezhXo3qE --single-select-option-id 47fc9ee4 --id <item-id>`);
   add label `status:in-progress`; comment on the issue ("Blake picking this
   up"); branch `claude/issue-N-slug` off `origin/main`.
3. **CONTEXT**: read `AGENTS.md` + the relevant `DESIGN.md` section + any tag-mapped doc.
4. **BUILD**: change only inside the issue's Lego slot in `build/`. Honor DESIGN.md
   tokens and the motion guardrail. One issue → one focused PR.
5. **VERIFY**: local server (`python3 -m http.server 8900 --directory build`),
   dark + light theme, `prefers-reduced-motion`, ~375px mobile.
6. **REVIEW**: move board Status → **In review** (option id `df73e18b`); swap
   label `status:in-progress` → `status:in-review`; present the diff + preview
   to Bala **here**. **Do NOT push / open PR / merge yet.**
7. **APPROVED** (Bala's explicit "yes"): create PR → squash-merge into `main` →
   delete branch → move board Status → **Done** (option id `98236657`) →
   close the issue → remove status label.
8. **LOOP**: poll again for the next task.

## Hard rules

- **Never merge, push, or deploy without Bala's explicit approval.**
  The In-Review → approved step *is* that approval.
- One task at a time. Stay inside the named scope — anything else spotted becomes a
  **new issue**, not a bundled fix.
- Never ship a fabricated "real" fact. Missing verified fact → flag + `needs-bala`.

## Cadence

- Self-paced poll roughly every 20–30 min while the session is live; idle quietly
  when nothing is routed to `claude`.
