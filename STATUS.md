# Foil Twin — STATUS

Generated 2026-09-03 after the Grok Build CLI job (times below in PT).

## Grok CLI

- Version: grok 1.0.13 (5e9a58528b76) [stable]
- Effort used: **xhigh** (accepted; not pinned to a model; no --no-auto-update)
- First command (with -p) **exit 2** at 14:30 PT: `-p/--single` requires a prompt value, so `-p --prompt-file` is invalid.
- Retry (flag fix, omit -p; `--prompt-file` already implies single-turn) **exit 0** at 15:03 PT (~33 min).
- Flags kept: `--prompt-file GROK_PROMPT.md --effort xhigh --always-approve --no-leader --cwd /workspace/projects/foil-twin`
- Auth: grok.com session valid (no auth failure). Existing TUI session in /workspace was not killed.
- Log: `/workspace/projects/foil-twin/grok-build.log`

## How to run

App path: `/workspace/projects/foil-twin`

Working directory: /workspace/projects/foil-twin
- Install: npm install (lockfile present; node_modules from grok job)
- Dev: npm run dev then open http://localhost:5173  (hash routes: #twin #map #progress)
- Production build: npm run build  — **verified OK** (vite 7.3.6, tsc -b + vite build)
- Sanity: npm run sanity — **verified OK**

## Catalog coverage

Retrieval date on every part: **2026-09-03**. All 89 parts have a `sources` array (URL + date + role). Matching dims: area_cm2, span_mm, aspect_ratio for wings; fuse_length_mm for fuselages. Unpublished numbers are `null` (not invented).

Core matching specs = area + span + AR for fronts/tails; overall length for fuses. Weight/chord often unpublished and not required by the matcher.

| Family | Sizes found | Core specs | Missing / notes |
| --- | --- | --- | --- |
| Axis Surge | 8: 1150, 1080, 1010, 950, 890, 830, 780, 740 | complete (area/span/AR/chord) | weight_g null |
| Axis ART v2 | 5: 1099, 999, 939, 879, 819 | complete | weight_g null; table spans 1100/1000/940/880/820 mm |
| Axis Spitfire | 10: 1180–620 (incl. 670, 620) | complete | weight_g null; official table PNG transcribed via foilit.de (labelled dealer-transcription) |
| Axis Fireball | 9: 1750, 1500, 1350, 1250, 1160, 1070, 1000, 940, 880 | complete | weight_g null |
| Armstrong UHA Front Foil | 7: 1270, 1070, 970, 870, 770, 670, 570 | complete (area/span/AR + weight) | chord_mm null. Official name is UHA; no UHF family on armstrongfoils.com |
| Armstrong HA Front Foil | 8: 1180, 1080, 980, 880, 780, 680, 580, 480 | complete | chord_mm + weight_g null |
| Armstrong MA Mk II Front Foil | 8: 1390, 1190, 990, 890, 790, 690, 590, 490 | complete | chord_mm + weight_g null |
| Axis Surf Skinny | 4: 340/50, 320/48, 300/45, 280/43 | complete | weight_g null |
| Axis Skinny | 8: 365/55 through 250/20 | complete | weight_g null; 358/30, 358/25, 250/20 noted downwind-only |
| Axis Progressive | 10: 475/68 through 250/56 | complete | weight_g null |
| Armstrong Speed | 1: 180 | area/span/AR present | chord/weight null; numbers from dealer transcription of Armstrong sheet (official page has no table) |
| Armstrong Dart | 2: 140, 120 | area/span/AR present | chord/weight null; dealer transcription |
| Armstrong Surf Mk II | 3: 200, 170, 130 | **area only** | span_mm, AR, chord, weight **null** — not on official page |
| Axis Black Advance+ | 4: Short 700, Ultra Short 640, Crazy Short 600, Silly Short 560 | length + mast 60 mm forward vs Standard | weight, mast-to-front, mast-to-tail, tail_lever **null** |
| Armstrong Titanium Core A+ | 2: TC60 600 mm, TC50 500 mm | length + construction | weight, mast-to-front, tail_lever **null**. TC70 exists but out of v1 |

## Matcher

Complete-setup score: front 62% + tail 23% + fuse 15%. Null dims are dropped and remaining weights renormalized.

- Front: log-area (50%), span (25%), AR (25%).
- Tail: role affinity 42% + area 32% + span 13% + AR 13%. Role map: Axis Skinny ≈ Armstrong Speed; Progressive ≈ Dart; Skinny Surf ≈ Surf Mk II. Role is a bonus, not a hard filter.
- Fuse: overall length only (tail lever / mast-to-front skipped because both brands leave those null). Axis Short 700 → TC60 (Axis longer); Ultra Short 640 → TC60; Crazy Short 600 = TC60 length; Silly Short 560 → TC50 500.
- Why-text is rider language from spec deltas (same-ish area, higher AR = more glide, shorter fuse = looser).
- Progression: same-brand 1–3 next setups from level/discipline/goal; other-brand twin of the top pick. Smaller area → speed; higher AR → glide; shorter fuse → looser; smaller tail → looser yaw. Area jump >~22% flagged **big**.

Sanity (real data, `npm run sanity`): ART v2 879 → HA 780 at 97% front; Fireball 1070 → UHA 870 93%; Fireball 1000 → UHA 770 95%; Surge 950 → HA 980 91%; Spitfire 840 → MA Mk II 990 83% (carve compromise).

## Gaps

- Armstrong UHF does not exist on armstrongfoils.com; catalog uses official **UHA**.
- Armstrong Speed/Dart numeric tables not on current official product pages; area/span/AR labelled `dealer-transcription`.
- Armstrong Surf Mk II span/AR unknown → tail scoring is area + role only.
- All fuselage mast-to-front / tail-lever / weight unknown → fuse matching is length-only. Axis Advance+ mast is 60 mm further forward than Standard (published note, used in why-text).
- Axis Spitfire table PNG dark-on-dark; numbers from foilit.de transcription of that table.
- Axis fuse Crazy Short: AXIS says 600 mm; some EU dealers 610 mm; catalog uses AXIS.
- HA / MA Mk II / Axis fronts: weight unpublished (matcher does not use weight).
- No login, no backend, no deploy, no git push.

## Verification (this wrapper)

- Project files present: Vite + React + TS, `src/data/catalog.ts`, views Map/Twin/Progress, README, SOURCES, MATCH_NOTES.
- Catalog: 55 fronts + 28 tails + 6 fuses; every part has source URL + 2026-09-03.
- Production build: **succeeded** (npm run build).
- Matcher sanity script: **succeeded** (npm run sanity).
- Existing interactive grok TUI (cwd /workspace) was left running.
