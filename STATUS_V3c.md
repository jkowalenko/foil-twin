# STATUS V3c — Progress skill-scaled ladder (small → bigger)

**Date:** 2026-09-06 (PT)  
**Grok CLI:** exit 0 (`grok-v3c.log`, effort xhigh, `--prompt-file` without `-p`, `--always-approve --no-leader`)  
**Build:** `tsc -b && vite build` → exit 0  
**Sanity:** `vite-node src/lib/sanity.ts` → exit 0  

## Changes

### Progress recommendations ladder by skill
Carousel still up to 3 slides, ordered **small → bigger**, while remaining **strict-forward** on the chosen goal (never pad with backwards or oversized jumps).

| Skill | Slide 1 | Later slides |
| --- | --- | --- |
| **Learning** | Fuse-only or tail-only | At most one same-family size step. No family jumps. No big area jumps. |
| **Comfortable** | Usually fuse and/or tail | Slide 2: one-size same-family front; slide 3: slightly larger / related-family same AR class if needed |
| **Pushing** | Still a small change (fuse/tail or tiny front) | Bigger front or family jump only as slide 2 or 3 |

### What counts as a small jump
- Fuse shorter/longer in the goal direction (e.g. tighter turns → shorter; glide feel → longer when it helps and does not violate hard rules).
- Tail toward the goal (e.g. more speed → smaller/skinnier/speed-role; tighter turns → progressive/dart-like).
- Front: one size step in the goal direction within same family when skill allows.

### Kept
- Strict goal axes: more speed/smaller size never larger area; more lift never smaller; tighter turns never longer fuse; more glide never lower AR.
- Other-brand twin of the **active** slide.
- Fewer than 3 slides when there are not enough strict-forward options for the skill.
- ProgressView badges / why-text: `small · tail`, `medium · front (one size)`, `big · front (family)`, etc.
- README + MATCH_NOTES brief notes.
- No invented specs. No git push.

## Sanity sample — ART v2 879, wing, more speed
- **Learning (2):** Skinny 359/40 `[small · tail]` → ART v2 819 `[medium · front (one size)]`. **Does not leap to Fireball as slide 1.**
- **Comfortable (3):** those two, then Fireball 1000 `[big · front (family)]`.
- **Pushing (3):** those two, then Fireball 880 `[big · front (family)]`.

Also: 275 strict-forward setup×goal cases → fails=0; skill-ladder fails=0.

## Files touched (by Grok)
- `src/lib/progression.ts` — skill-scaled ladder ranking
- `src/components/ProgressView.tsx` — step-size copy
- `src/lib/sanity.ts` — learning must not open with Fireball; skill-ladder checks
- `README.md`, `MATCH_NOTES.md` — brief notes
