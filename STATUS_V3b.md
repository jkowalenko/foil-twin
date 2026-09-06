# STATUS V3b — Twin front floor + Map AR classes

**Date:** 2026-09-06 (PT)  
**Grok CLI:** exit 0 (`grok-v3b.log`, effort xhigh)  
**Build:** `tsc -b && vite build` → exit 0  
**Sanity:** `vite-node src/lib/sanity.ts` → exit 0  

## Changes

### 1. Twin page gate = front wing ≥ 75%
- Renamed `MIN_COMPLETE_TWIN` → `MIN_FRONT_TWIN = 75` in `src/lib/match.ts`.
- Twin lists a complete setup only when **front score ≥ 75%**; overall (62/23/15) still ranks and displays.
- Empty-state / subtitle copy updated to say front wing match.
- Sanity: ART v2 879 keeps 36 setups on front floor vs 13 on old overall floor; no weak-front rows listed.

### 2. Map AR class bands
- Exported `arClass()` / `sameArClass()` in `src/lib/match.ts`:
  - carve: AR < 9.0
  - mid: 9.0 ≤ AR < 11.5
  - high: AR ≥ 11.5
  - null AR → no cross-class pairing
- Map part-compare uses `rankFrontTwins(..., { sameArClass: true })`.
- Map UI hints selected wing class (e.g. "mid AR class").
- Twin / Progress / Quiver ranking unchanged.

## Docs
README + MATCH_NOTES briefly updated. No git push.
