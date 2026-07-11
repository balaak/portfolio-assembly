# Portfolio Assembly — Bala Kumaran

Personal portfolio for **Bala Kumaran** — Head of Product Design (Kochi → Dubai).

Assembled Lego-style: the visual system is a Claude cloud-design, faithfully rebuilt;
the hero is a bespoke **WebGL2 ASCII-portrait** engine with a cursor gravity-lens.

## Stack
- Plain **HTML / CSS / JS** — no build step
- Self-hosted **Geist** (variable) + **Sora**
- **Lenis** smooth-scroll · dependency-free counters & reveals · WebGL2 ASCII hero
- Published to **GitHub Pages** from `build/` via GitHub Actions

## Develop locally
```bash
python3 -m http.server 8900 --directory build
# → http://localhost:8900/
```

## Structure
- `build/` — the published site (index.html, hero engine, fonts)
- `DESIGN.md` — the design bible: tokens, motion system, section architecture

---
Private working notes (`CONTENT-TRUTH.md`, `reference/`) are kept local and are **not** committed.
