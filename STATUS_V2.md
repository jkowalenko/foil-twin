# Foil Twin — STATUS v2

Generated 2026-09-04. Builds on v1 ([STATUS.md](./STATUS.md)). Matching honesty unchanged: unpublished numbers stay `null`; no invented specs.

## What shipped

- Dark default + **light theme** toggle. Preference in `localStorage` key `foil-twin-theme`. First visit = dark (`index.html` sets `data-theme` before paint).
- Official AXIS and Armstrong wordmarks from manufacturer CDNs in `public/brand/`, used in the header, Twin brand toggle, Map legend / tooltip / compare, Quiver. See [SOURCES.md](./SOURCES.md). Not a trademark license.
- **Map:** hover tooltip (family + size, area, span, AR). Top-right `<select>` shares the same selection model as clicking a chart point.
- **Progress:** always **3** recommendations in a prev/next + dots carousel. Slide 1 is best. Other-brand twin follows the **active** slide. Single discipline selector kept.
- **Quiver** (`#quiver`): local-only inventory + named setups. Multi-discipline gaps, same-brand buy recs, brand-convert (every owned part → nearest other-brand twin, unique counts, overlap savings, other-brand progression path).
- **Masts:** 40 live official SKUs (23 Axis / 17 Armstrong), retrieved 2026-09-04. Wired into Quiver only. Twin fuse matching unchanged.
- Twin results grouped by front wing; fuse/tail variants listed under the best complete setup.

## Storage

| Key | Shape |
| --- | --- |
| `foil-twin-theme` | `"dark"` \| `"light"` |
| `foil-twin-v1` | current Twin/Progress `Setup` `{ brand, frontId, fuseId, tailId }` |
| `foil-twin-quiver-v1` | versioned `QuiverDoc` (see README). `owner: null` reserved for future cloud login |

No auth, no backend, no deploy, no git push.

## Mast catalog (honest gaps)

- Axis 16mm aluminium: collection copy + size chart still mention it; product URLs 404 on 2026-09-04 → **not cataloged**.
- Original Axis carbon 760/860/960: chart image still on the carbon collection; not in the current product list → **not cataloged**.
- Axis Power Carbon / HM / PRO / KAIWI / Foil Drive: **weight unpublished** (`null`).
- Armstrong Alloy: weight / thickness / chord unpublished.
- Armstrong Foil Drive masts: length + pod height published; weight unpublished.
- PRO 13.5 mm is the published **bottom-section** thickness, stored with a note.
- Armstrong Performance Mk II official URL spelling is `peformance-mk-ii-carbon-mast`.

## Logos

Official files from axisfoils.com and armstrongfoils.com. If those assets had been missing or rights unclear, the fallback was styled text marks. They were available, so the real wordmarks are used and sourced.

## Verification

- `npm run build` — **OK** (`tsc -b && vite build`).
- `npm run sanity` — **OK**. 40 masts (23 Axis / 17 Armstrong), all have sources + length; 12 Armstrong masts have published weights. Progression sample count=3. Twin pairings unchanged from v1. Mast twins: Axis 75 cm alloy ↔ Armstrong 72 cm alloy 89%; Axis PRO 800 ↔ Armstrong Performance Mk II 795 98%.
- Browser (Chrome CDP against `vite preview` on :4173): Twin grouped-by-front + variant chips; official logos in header; theme toggle dark→light persists `foil-twin-theme`; Map compare `<select>` (56 options) + hover tooltip with area/span/AR; Progress carousel 3 dots / 3 of 3 + other-brand twin of the active slide; Quiver `#quiver`, storage key, own ART v2 879 + 75 cm mast, `foil-twin-quiver-v1` written, gaps + brand convert render. Mobile viewport Twin/Quiver usable.
