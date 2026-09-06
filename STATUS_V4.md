# STATUS V4 — Quiver fuse adjacency + convert coverage tiers

**Date:** 2026-09-06 (PT)
**Grok CLI:** exit 0 (grok-v4.log, effort xhigh, --prompt-file GROK_PROMPT_V4.md, --always-approve)
**Build:** tsc -b && vite build → exit 0
**Sanity:** vite-node src/lib/sanity.ts → exit 0

## A) Fuse ladder adjacency
pickShorterFuse walks same-familyOfficial length ladder one adjacent step via shorterFuse/longerFuse (family-scoped in progression.ts). Short+Ultra Short → Crazy Short (not Silly Short).

## B) Brand convert coverage
Greedy set-cover of checked owned parts; ~80%/~90% shortest prefixes. Progressive min-max range when family has 3+ sizes. UI: convert-tier cards + range line. Disciplines/level/goal annotated on path.

## Sanity highlights
- fuse recs: axis-advplus-crazyshort
- 5 ART fronts: 80%=4 buys, 90%=5, HA 680-1180 progressive pair
- overlap collapse still 3 fronts → 2 unique
