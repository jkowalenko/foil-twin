# Foil Twin

A local, static matcher for riders who own or shop **Axis** and **Armstrong**. Pick a complete setup (front + fuselage + tail) on one brand and see ranked equivalents on the other. Then get a next-setup suggestion as you progress.

Not a brochure. Specs come from manufacturer pages. If a number is not published, it is stored as `null` and the matcher skips that dimension instead of inventing it.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm run build     # production build
npm run sanity    # print a few known pairings to the terminal
```

No login, no backend, no deploy. Catalog lives in `src/data/catalog.ts`.

## Views

- **Map** — every v1 front wing on area (log) vs aspect ratio or span. Color by family. Click a wing to highlight nearest other-brand fronts and open **part compare**.
- **Twin** — build a complete setup, see the spec stack, and rank other-brand equivalents (front + fuse + tail) with a plain-language why.
- **Progress** — current setup + rider level + discipline + goal → 1–3 next setups on the **same brand**, plus the closest other-brand twin of the top pick.

## Catalog (v1)

**Axis fronts:** Surge, ART v2, Spitfire, Fireball — every published size.

**Axis tails:** Surf Skinny, Skinny, Progressive — every published size.

**Axis fuselages:** Black Advance+ Short (700 mm), Ultra Short (640), Crazy Short (600), Silly Short (560). Mast sits 60 mm further forward than original Black Standard. Weight and tail-lever mm are not published.

**Armstrong fronts:** UHA, HA, MA Mk II — every published size. Official names from armstrongfoils.com. There is no current **UHF** family; UHA is the ultra-high-aspect line.

**Armstrong tails:** Speed (180), Dart (120 / 140), Surf Mk II (130 / 170 / 200).

**Armstrong fuselages:** Titanium Core A+ **TC60** (600 mm) and **TC50** (500 mm). TC70 exists on the official page but is out of v1 scope.

Sources and retrieval date: [SOURCES.md](./SOURCES.md). Pairing sanity check: [MATCH_NOTES.md](./MATCH_NOTES.md).

## How matching works

A complete-setup score is:

| Piece | Weight | What is compared |
| --- | --- | --- |
| Front | 62% | Area on a **log** scale, span, aspect ratio |
| Tail | 23% | Role map + area + span + AR |
| Fuselage | 15% | Overall length. Tail lever / mast-to-front only if **both** sides publish a number (they currently do not). |

Missing numbers are dropped and the remaining weights are renormalized. Nothing is hallucinated to fill a gap.

### Tail role map (starting heuristic)

Manufacturer language did not contradict this, so v1 keeps it:

- Axis **Skinny** ≈ Armstrong **Speed** — low-drag, glide, locked yaw
- Axis **Progressive** ≈ Armstrong **Dart** — looser yaw, quicker carve
- Axis **Skinny Surf** ≈ Armstrong **Surf** (Surf Mk II) — surf roll + yaw control

Role is a bonus, not a hard filter. Area/span/AR still score.

### Fuselage map (length only)

| Axis Advance+ | mm | Closest Armstrong A+ in v1 |
| --- | --- | --- |
| Short | 700 | TC60 (600) — Axis is longer |
| Ultra Short | 640 | TC60 |
| Crazy Short | 600 | TC60 — same overall length |
| Silly Short | 560 | TC50 (500) |

Axis Advance+ parks the mast 60 mm further forward than Axis Standard, so a 600 mm Crazy Short is **not** a 1:1 TC60 in pitch feel even when the overall lengths match. The UI says so.

### Why copy

Explanations are written in rider language from the spec deltas, for example: same-ish area, higher AR so more glide, shorter fuse so looser.

## Progression

Inputs: current setup, level (learning / comfortable / pushing), discipline (wing, surf/prone, downwind, wake, race), goal (more speed, more lift/low-end, tighter turns, more glide, smaller size).

Rules of thumb:

- Smaller area → more speed, less lift
- Higher AR → more glide, less roll
- Shorter fuse → more maneuverable, less stable
- Smaller tail → looser yaw

Learning stays on one size step. Pushing may skip a size. A **big** jump is flagged when area changes by more than ~22%.

## Disclaimer

Numbers are manufacturer-published (or clearly labelled dealer transcriptions of those sheets). Feel still varies by mast, board, rider weight, shims, and conditions. This is a spec matcher, not a session report.
