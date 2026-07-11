# AGENTS.md — Standing rules for any agent working this repo

Read this before picking up **any** issue. Applies equally to Claude, Codex, Gemini,
Grok, or any other coding agent — Bala runs experiments across multiple agents on
this repo, so behavior must stay consistent regardless of who's driving.

---

## 1 · Source of truth

- **`DESIGN.md`** is the design bible — tokens (color, type, spacing, radius),
  motion system, and section architecture. Every visual decision must resolve to
  a value already defined there. Don't invent a new hex, font size, or spacing
  value "close enough" — if it's not in `DESIGN.md` §2, it doesn't go in the page.
- **`README.md`** has the stack and local dev command.
- **`CONTENT-TRUTH.md`** (gitignored, local-only, not in this repo) is the
  verified-facts source. If you don't have it and a task needs a real fact
  (client name, cert, metric, date) that isn't already in `DESIGN.md` or the
  issue body — **stop and flag it**, don't invent a placeholder that reads as
  real. Fabricated "real" facts are a harder problem to catch than an empty
  field.

## 2 · Motion & transitions — hard guardrail

**Do not introduce any new animation, transition, or easing pattern without
Bala's explicit approval in the issue thread.**

- `DESIGN.md` §3 documents the full motion system and the six "signature
  moments" already in use (word-by-word H1 reveal, infinite marquee, macOS
  window counters, odometer scoreboard, scroll-pinned process, timeline
  reveal) plus the house rules: reveals fire once, counters ease-out, honor
  `prefers-reduced-motion`, target 60fps.
- New sections reuse an **existing** pattern from §3 — most commonly the
  scroll-reveal-once treatment. If it's genuinely unclear which existing
  pattern fits, default to the simplest one already documented (a plain
  fade+rise scroll reveal) and say so in your PR description.
- No parallax, no 3D tilt, no custom easing curves, no new libraries for
  motion — unless the issue itself explicitly authorizes it. When in doubt,
  fall back to what's already shipped rather than adding something new.

## 3 · Scope discipline

- Stay inside the Lego slot your issue names. `DESIGN.md` §4 lists the section
  architecture — don't touch sections outside your issue's scope, even if you
  spot something you'd improve. Flag it as a new issue instead.
- One issue → one focused change. Don't bundle unrelated fixes into the same PR.

## 4 · Build stack constraints

- Plain **HTML / CSS / JS**, no build step, no new framework, no bundler.
- Fonts: self-hosted Geist / Geist Mono / Sora only — no Google Fonts CDN or
  other third-party font CDN.
- Motion libraries already in the stack: GSAP + ScrollTrigger, anime.js,
  Lenis. Don't add a new animation library.
- Structure: `build/` is the published site, `build/assets/` holds fonts and
  real images. Don't create a parallel structure.

## 5 · Local dev & verification

```bash
python3 -m http.server 8900 --directory build
# → http://localhost:8900/
```

Before opening a PR: load the page in both dark (default) and light theme,
check `prefers-reduced-motion` still shows a sane end-state, and check mobile
width (~375px) alongside desktop.

## 6 · Definition of done (generic — issues layer their own on top)

- [ ] Every color/type/spacing value traces to a `DESIGN.md` §2 token
- [ ] Motion reuses an existing `DESIGN.md` §3 pattern, or was explicitly
      approved in the issue thread if new
- [ ] No fact shipped that isn't verified (real client names, certs, metrics
      require a `CONTENT-TRUTH.md` entry or explicit sign-off in the issue)
- [ ] Responsive, both themes checked, `prefers-reduced-motion` respected
- [ ] Scope stayed inside the named Lego slot — nothing else touched
- [ ] If the change adds a new section, `DESIGN.md` §4 updated to reflect it

## 7 · Labels (for issue triage — informational, not an action item for agents)

| Label | Meaning |
|---|---|
| `content` | copy, facts, résumé truth, section text |
| `design` | layout, type, color, spacing, visual polish |
| `motion` | animation, transitions, micro-interactions |
| `build` | code, structure, deploy, performance |
| `agent-ready` | scoped tightly enough to hand off autonomously |
| `needs-bala` | blocked on Bala's input/decision — don't start until unblocked |
