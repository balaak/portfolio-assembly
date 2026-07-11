# DESIGN.md — Bala Portfolio Assembly

> **The design bible.** Every Lego block checks against this file.
> **Visual source of truth:** the cloud-design export → `reference/portfolio_source.html` (captured live, tokens below).
> **Content source of truth:** `CONTENT-TRUTH.md` — the cloud-design's identity is **100% dummy**; never ship a fact from it unverified.

---

## 0 · North star

| | |
|---|---|
| **Purpose** | Bala Kumaran's portfolio for a **Dubai job hunt** |
| **Positioning** | **Hire me — Head of Product Design** (not a studio pitch, not "founder"). Matches Bala's own locked decision (`Obsidian/05 — Personal/Dubai-Portfolio-Build.md`, 2026-07-10) |
| **Method** | **Lego** — assembled block by block. **Faithful-first**: rebuild the cloud-design exactly (tokens, motion, layout), *then* improve per section |
| **Voice** | Dark, warm, engineering-honest editorial. *"The designer who ships numbers."* Mono labels, OS-window motif, an honest scoreboard |
| **Contact on site** | balaashokan@gmail.com · linkedin.com/in/balakumaranux (NOT the 91pixels studio email) |

---

## 1 · Brand character

A restrained, premium, developer-adjacent editorial system. Personality cues from the source we're keeping: monospace section labels (`WHAT I DO`, `IN NUMBERS`, `KEPT HONEST`), a fake **macOS browser window** in the hero framing a live artifact, **counting metrics**, and a "scoreboard, kept honest." Swiss typographic discipline meets a terminal. It signals: *senior, precise, measurable, systems-minded* — exactly Bala's résumé thesis (design systems at national-bank scale + conversion craft).

---

## 2 · Design tokens — LOCKED (captured live from the running export)

### 2.1 Typography
| Role | Family | Fallback stack |
|---|---|---|
| Sans (display + body) | **Geist** | `-apple-system, system-ui, "Helvetica Neue", sans-serif` |
| Mono (labels, metrics, UI chrome) | **Geist Mono** | `ui-monospace, "SF Mono", Menlo, monospace` |
| Serif (accent / emphasis) | **Georgia** | `serif` |

**Type scale (px):** `--t-mono-xs 11` · `--t-mono-sm 12` · `--t-body-sm 14` · `--t-body 16` · `--t-body-lg 18` · `--t-h5 20` · `--t-lede 22` · `--t-h4 24` · `--t-h3 32` · `--t-h2 44` · `--t-h1 64` · `--t-display 96`

**Heading specs:** H1 = 64px / weight **500** / tracking **−1.92px** / line-height 1.02 · H2 = 44px / 500 / −1.1px · Body = 16px / 1.5 · Mono labels = 11–12px, uppercase, wide tracking.

### 2.2 Color — OKLCH (dark = default, light = toggle)
| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `oklch(0.155 0.012 70)` | `oklch(0.965 0.018 90)` |
| `--bg-elevated` | `oklch(0.19 0.013 70)` | `oklch(0.985 0.012 90)` |
| `--surface` | `oklch(0.22 0.013 70)` | `oklch(0.93 0.025 88)` |
| `--surface-2` | `oklch(0.26 0.014 70)` | `oklch(0.90 0.03 86)` |
| `--border` | `oklch(0.30 0.015 70)` | `oklch(0.84 0.035 82)` |
| `--border-strong` | `oklch(0.42 0.018 72)` | `oklch(0.72 0.04 78)` |
| `--ink` (text) | `oklch(0.96 0.015 90)` | `oklch(0.18 0.012 60)` |
| `--ink-2` | `oklch(0.82 0.014 85)` | `oklch(0.34 0.012 60)` |
| `--ink-3` | `oklch(0.66 0.013 80)` | `oklch(0.52 0.014 65)` |
| `--ink-muted` | `oklch(0.52 0.012 75)` | `oklch(0.66 0.014 70)` |
| `--accent` (gold) | `oklch(0.86 0.19 95)` | `oklch(0.88 0.18 95)` |
| `--accent-ink` | `oklch(0.18 0.04 90)` | `oklch(0.22 0.05 90)` |
| `--tomato` | `oklch(0.70 0.20 32)` | `oklch(0.62 0.22 30)` |
| `--sage` | `oklch(0.72 0.13 150)` | `oklch(0.62 0.12 150)` |
| `--violet` | `oklch(0.66 0.19 290)` | `oklch(0.58 0.20 290)` |
| `--cobalt` | `oklch(0.70 0.15 245)` | `oklch(0.62 0.16 245)` |

*(each accent also has a `-soft` variant; `--accent` gold is the primary highlight — e.g. the word "convert" in the hero.)*

**Ring (focus):** `0 0 0 3px oklch(0.88 0.18 95 / 0.45)` · **Shadows:** sm/md/lg layered, black-alpha in dark, ink-alpha in light.

### 2.3 Spacing / Radius
**Spacing (4px base, px):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128` (`--sp-1`…`--sp-10`)
**Radius (px):** `4 · 6 · 10 · 16 · 24 · 999(pill)` (`--r-xs`…`--r-xl`, `--r-pill`)

### 2.4 Theme
Dual theme via `[data-theme="dark|light"]` on `<html>`. **Dark is default.** A header toggle switches themes. Respect `prefers-color-scheme` on first load.

---

## 3 · Motion system

**Libraries (faithful rebuild — matches both the export and Bala's existing `bala-portfolio` stack):**
- **GSAP + ScrollTrigger** — scroll reveals (once), pinned process steps, metric counters
- **anime.js** — marquee ticker, small micro-interactions
- **Lenis** — smooth scroll (from Bala's existing stack)
- **Three.js** — *optional* WebGL texture/shader in hero background (evaluate perf before keeping)

**Signature moments (the stuff Bala loves — preserve these):**
1. **Word-by-word H1 reveal** — each word wrapped, staggered rise + fade
2. **Infinite marquee** skill ticker (`UI/UX ✦ DESIGN SYSTEMS ✦ MOTION …`)
3. **macOS-window hero card** — traffic-lights chrome, a live artifact, **counting metrics** (0 → real number on view)
4. **Odometer scoreboard** — big numbers count up on scroll-in
5. **Scroll-pinned process** — steps advance as you scroll
6. **Timeline reveal** — career chapters slide in

**Rules:** reveals fire **once** (no re-trigger jitter) · counters ease-out · honor `prefers-reduced-motion` (skip transforms, show end-state) · target 60fps, `will-change` only on active elements.

---

## 4 · Section architecture — the 7 Lego slots

Each slot: **dummy → real** content map. Full facts in `CONTENT-TRUTH.md`.

| # | Slot | Keep (design) | Real content (replaces dummy) |
|---|---|---|---|
| 1 | **Hero + OS-window card** | Big Geist H1, gold highlight, OS-window w/ counting metrics | Eyebrow → "Head of Product Design · Kochi → Dubai". Card → a real artifact (design-system/theming or PG SDK checkout). Stat line → "14+ yrs · design systems at national-bank scale · 5 platforms" |
| 2 | **4 Practices** | 4-card "operating system" | Design Systems at Scale · Payments & Product UX · AI-Augmented Design · Design Leadership & CRO |
| 3 | **Process (6 wks / 4 moves)** | Scroll-pinned steps | His real method: Diagnose → Design → Govern → Ship (design-system governance flavor) |
| 4 | **6 Projects** | Project grid w/ tags + metrics | **Multi-Brand Design System** (flagship) · **BillDesk PG SDK** · **AI color-token pipeline** · **TATA 1mg CRO** · **ASKME Bazaar** · **Mindhelix Rico** — *banks anonymized* |
| 5 | **Scoreboard** | Odometer counters | 14+ yrs · 3,000+ components · 20–25 bank brands · 9M+ downloads · 30k txns/min · $100K+ Kickstarter |
| 6 | **Writing** | Notes cards | Real: multi-tenant DS case study; "DESIGN.md" experiment. *(Or fold into Projects if thin.)* |
| 7 | **Timeline + Footer** | Career chapters, contact | Mindhelix → ASKME → MobME → TATA 1mg → Hatio/BillDesk. Footer → balaashokan@gmail.com, LinkedIn, "Kochi → Dubai" |

**Removed entirely:** fake testimonials (Anika Rao / Daniel Hsu), fake freelance CTAs ("two slots open"), 91pixels founder framing.

---

## 5 · Content model
See **`CONTENT-TRUTH.md`** for the full verified dataset + the dummy→real correction table + confidentiality rules (anonymize all bank/client names publicly) + open gaps (real testimonials, hero artifacts, AI-photography copy).

---

## 6 · Build stack (faithful + deployable)

Matches Bala's existing `bala-portfolio` and 91pixels defaults — no framework lock-in, non-coder-friendly, edge-deployable:
- **Plain HTML + CSS + vanilla JS** (no React build step)
- **GSAP + ScrollTrigger + anime.js + Lenis** for motion; **Three.js** only if the WebGL moment earns its weight
- **Self-hosted Geist + Geist Mono** (`woff2`, `<link rel="preload">`) — no Google CDN (per design standards)
- **Deploy:** Cloudflare Pages (Wrangler) or GitHub Pages — decide at first deploy
- **Structure:** `build/` = the site · `assets/` = fonts + real images (headshots exist) · `reference/` = cloud-design source + captures

---

## 7 · Assembly roadmap (Lego order)

1. ✅ Ingest cloud-design, extract design system, vet all facts → this file + `CONTENT-TRUTH.md`
2. ⬜ Scaffold `build/` — tokens.css (all vars above), self-hosted Geist, base layout + theme toggle
3. ⬜ **Block 1: Hero** — faithful rebuild (H1 reveal, OS-window card, real eyebrow/stats)
4. ⬜ Block 2: Marquee + Practices
5. ⬜ Block 3: Projects grid (real, anonymized) + flagship case-study link
6. ⬜ Block 4: Scoreboard counters (real numbers)
7. ⬜ Block 5: Process + Timeline
8. ⬜ Block 6: Footer/contact + writing
9. ⬜ Polish pass (improve per section), perf, a11y, reduced-motion, responsive
10. ⬜ Deploy + verify live

*Bala drives the order — he'll screenshot sections he likes from the `bala-portfolio` GitHub repo (ASCII hero, etc.) and we graft them in.*

---

## 8 · Bala's action items / open decisions
- **Real hero artifact(s)** for the OS-window card (design-system shot / PG SDK checkout / Spectrum)
- **Real testimonials** (named quotes) — or we cut the section
- **AI-photography** — no copy exists on file; write fresh with Bala or drop it
- **Headshots** exist (`Documents/Bala portfolio/bala images/`) — pick the hero image
- **GitHub repo link** for `bala-portfolio` (ASCII hero + sections to graft) — Bala to share
- Confirm: include InstaShift (Estonia, 2017–19) in timeline? (on LinkedIn, off résumé)
