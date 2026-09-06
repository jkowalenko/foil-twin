# Foil Twin STATUS_V3

Upgrade run: 2026-09-06 via real Grok Build CLI (grok 1.0.13, --effort xhigh).

## Outcome

| Check | Result |
| --- | --- |
| Grok CLI exit | 0 |
| build | pass |
| sanity | pass (275 cases, 0 fails; twin 75% floor; quiver overlap) |

No deploy, no git push.

## Files changed (by Grok)

- TwinView SetupBuilder SpecStack ProgressView QuiverView
- match.ts progression.ts quiver.ts sanity.ts index.css
- README.md MATCH_NOTES.md

Untracked: GROK_PROMPT_V3.md grok-v3.log; screenshots/arm-logo-live.png (prior)

## Twin page

1. Brand selectors: BrandMark logos only (no Ride label, no brand name text).
2. Right panel title: {Brand} twin setups (e.g. Armstrong twin setups).
3. Only complete setups with overall match >= 75% (MIN_COMPLETE_TWIN). Empty state if none.
4. Tail lever removed from UI everywhere. Unpublished; unused in matching; not invented.

## Progress - strict progression rule table

Recommendations must strictly advance the chosen goal. Never pad with backwards moves. Carousel up to 3 best-first; show fewer if needed. Other-brand twin follows active slide.

| Goal | Must advance (at least one) | Hard never |
| --- | --- | --- |
| more speed | smaller front area and/or higher-speed family | never larger area |
| more lift / low-end | larger front area | never smaller area |
| tighter turns | shorter fuse and/or lower AR / carve family | never longer fuse |
| more glide | higher AR and/or higher-AR family | never lower AR |
| smaller size | smaller front area | never larger area |

Implemented in isStrictForward() (src/lib/progression.ts). Sanity: 275 setup x goal cases, 0 fails. Sample ART v2 879 / more speed: 819 -> Fireball 880 -> Fireball 940.

## Quiver - conversion UX

1. Each owned part (front, tail, fuse, mast) has include checkbox. Default: all checked.
2. Multiple checked owned fronts mapping to same other-brand front at >= 85% front match are collapsed (FRONT_OVERLAP_MIN).
3. Buy list = unique other-brand parts for checked items; overlap savings highlighted.
4. Unchecked items excluded from buy list and collapse math.

Sanity sample: HA 780 covers ART v2 879 (97%) + Surge 890 (85%); uncheck-all => buyList=0.

## Otherwise unchanged

Twin/Map/Progress/Quiver still work. Theme/logos unchanged except Twin selector layout. Matching honesty preserved. No deploy, no git push, no secrets.
