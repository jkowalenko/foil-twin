# Foil Twin

A local, static matcher for riders who own or shop **Axis**, **Armstrong**, and **Code**. Pick a complete setup (front + fuselage + tail) on one brand and see ranked equivalents on another. Then get a next-setup suggestion as you progress.

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

Hash routes: `#twin` `#map` `#progress` `#quiver`.

- **Map** — every v1 front wing on area (log) vs aspect ratio or span. Color by family. Hover a point for name + area/span/AR. Pick a wing from the top-right menu or click a point; both drive **part compare**. Part compare only lists nearest other-brand fronts in the **same AR class** (carve / mid / high).
- **Twin** — build a complete setup, see the spec stack, and rank **twin setups** on a chosen other brand (front + fuse + tail) with a plain-language why. Ride-brand and target-brand selectors are logos only and cannot be the same. Only complete setups whose **front wing** is at **75% match or better** are listed (overall score is still shown and used to rank); if none clear that bar, the right panel says so. Results are grouped by front wing; fuse/tail variants sit under the best complete setup.
- **Progress** — current setup + rider level + discipline + goal → up to **3** next setups on the **same brand** as a carousel, ordered **small → bigger** (fuse/tail first, then a one-size front, then a larger or family step if skill allows). Recommendations must **strictly advance** the chosen goal (never a backwards move on that goal's primary axis). If fewer than 3 strict-forward options exist, fewer are shown. The other-brand twin is for the **active** slide.
- **Quiver** — browser-only inventory (masts, fuses, fronts, tails) plus named complete setups. Multi-discipline gap check, same-brand buy suggestions, and a brand-convert map: each owned part can be included or excluded (default: all included). Unchecked items are left out of the buy list and overlap math. Checked items produce a unique other-brand buy list with overlap savings. Multiple owned fronts that map to the same other-brand front at **≥ 85% front match** are collapsed.

Theme defaults to **dark**. The header toggle persists `foil-twin-theme` in localStorage (`dark` | `light`).

Axis, Armstrong, and Code marks in the header / Twin / Map / Quiver are the official wordmarks copied from the manufacturer sites for identification. See [SOURCES.md](./SOURCES.md).

## Catalog (v1)

**Axis fronts:** Surge, ART v2, Spitfire, Fireball — every published size.

**Axis tails:** Surf Skinny, Skinny, Progressive — every published size.

**Axis fuselages:** Black Advance+ Short (700 mm), Ultra Short (640), Crazy Short (600), Silly Short (560). Mast sits 60 mm further forward than original Black Standard. Weight and tail-lever mm are not published.

**Armstrong fronts:** UHA, HA, MA Mk II — every published size. Official names from armstrongfoils.com. There is no current **UHF** family; UHA is the ultra-high-aspect line.

**Armstrong tails:** Speed (180), Dart (120 / 140), Surf Mk II (130 / 170 / 200).

**Armstrong fuselages:** Titanium Core A+ **TC60** (600 mm) and **TC50** (500 mm). TC70 exists on the official page but is out of Twin v1 scope.

**Code fronts (v10, retrieved 2026-09-08):** S Series (AR 9.5), R Series (AR 13.0), X Series (AR 8.2), Kanga — every size on the official product pages.

**Code tails:** AR Series (surf, AR 8.64), R Series Tail (speed, AR 10.8), Race Tails (speed).

**Code fuselages:** 2XS / X-Small / Small / Medium / Large — official “length from front of mast” 420–540 mm in 30 mm steps.

**Masts (v2, retrieved 2026-09-04):** every live product on the official Axis and Armstrong mast collections. Axis: 19mm aluminium (7 lengths), Power Carbon, Power Carbon High Modulus, FATTY, PRO UHM, KAIWI, Foil Drive HM/UHM 800. Armstrong: Alloy 58/72/85 cm, Mk II Carbon, Performance Mk II, Performance-X, Foil Drive Assist + E-Foil integrated. Weight / thickness / chord only where the manufacturer printed them. 16mm Axis aluminium is mentioned in collection copy but had no live product pages on retrieval, so it is not in the catalog.

**Code masts (v10, retrieved 2026-09-08):** Original HM 75/80/85, Plus UHM 75/80/85/95, Black Series 75/80/85 (thickness published), Aluminium 75/80 (18.7 mm / 120 mm chord), Foil Drive Integrated 78 cm with 11 cm and 17 cm pods.

Masts are used in **Quiver** (inventory, named setups, convert, buy recs). Twin fuselage matching is unchanged (length only). Code foil parts are unpriced.

Sources and retrieval dates: [SOURCES.md](./SOURCES.md). Pairing sanity check: [MATCH_NOTES.md](./MATCH_NOTES.md). Status: [STATUS_V2.md](./STATUS_V2.md).

## How matching works

A complete-setup score is:

| Piece | Weight | What is compared |
| --- | --- | --- |
| Front | 62% | Area on a **log** scale, span, aspect ratio |
| Tail | 23% | Role map + area + span + AR |
| Fuselage | 15% | Overall length. Mast-to-front only if **both** sides publish a number (they currently do not). Tail lever is unpublished on both brands, unused in matching, and not shown in the UI. |

Missing numbers are dropped and the remaining weights are renormalized. Nothing is hallucinated to fill a gap. The Twin page only lists complete setups whose **front-wing score is 75% or better**. Overall score is still shown and used to rank; fuse/tail cannot pull a weak front onto the list.

### Map AR classes

Part-compare / nearest-other-brand on the Map never treats wings in different aspect-ratio classes as similar, even if area or span are close. Bands use published `aspect_ratio` (`arClass()` in `src/lib/match.ts`):

| Class | Aspect ratio |
| --- | --- |
| carve | AR < 9.0 |
| mid | 9.0 ≤ AR < 11.5 |
| high | AR ≥ 11.5 |

A wing with unpublished AR has no class and is not paired across classes.

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

Recommendations are **strict-forward** on the chosen goal. They never recommend a setup that goes backwards on that goal's primary axis:

- **More speed** — smaller front area and/or a clearly higher-speed family; never larger area
- **More lift / low-end** — larger front area; never smaller
- **Tighter turns** — shorter fuse and/or lower AR / more carve-oriented family; never a longer fuse
- **More glide** — higher aspect ratio and/or a higher-AR family; never lower AR
- **Smaller size** — smaller front area; never larger

Up to 3, **small → bigger**. If fewer strict-forward options exist, the carousel is shorter — it does not pad with backwards moves or with jumps that are too big for the rider level.

Jump size is about **what changed**, not just area:

- **Small** — fuse-only or tail-only in the goal direction (shorter fuse for tighter turns; longer fuse for glide feel; smaller/speed-role tail for more speed; dart/progressive tail for tighter turns).
- **Medium** — one size step in the same family, still in the goal direction.
- **Bigger** — a further same-family size skip, or a related-family / AR-class move.

Skill caps:

- **Learning** — fuse/tail, or at most one same-family size. Never a family jump. Never a big area skip.
- **Comfortable** — slide 1 is usually fuse/tail; slide 2 a one-size front; slide 3 can be a slightly larger front still in the same AR class or a related family.
- **Pushing** — slide 1 is still a small change; a bigger front or family jump only as a later slide.

A **bigger** step is also flagged when the front family changes. Area jumps over ~22% are called out in the why-text.

## Quiver storage

No auth, no backend. The quiver document lives in `localStorage` under **`foil-twin-quiver-v1`**.

```ts
{
  version: 1,
  owner: null,          // reserved for a future cloud login
  updated: string,      // ISO timestamp
  parts: {
    mastIds: string[],
    fuseIds: string[],
    frontIds: string[],
    tailIds: string[],
  },
  setups: Array<{
    id: string;
    label: string;
    brand: "axis" | "armstrong";
    mastId: string;
    fuseId: string;
    frontId: string;
    tailId: string;     // brand-consistent
  }>,
  disciplines: Array<"wing" | "surf" | "downwind" | "wake" | "race">,
  level: "learning" | "comfortable" | "pushing" | null,
  goal: "more-speed" | "more-lift" | "tighter-turns" | "more-glide" | "smaller-size" | null,
}
```

Unknown catalog ids are dropped on load. Other keys: `foil-twin-v1` (Twin/Progress current setup), `foil-twin-theme`.

## Disclaimer

Numbers are manufacturer-published (or clearly labelled dealer transcriptions of those sheets). Feel still varies by mast, board, rider weight, shims, and conditions. This is a spec matcher, not a session report.
