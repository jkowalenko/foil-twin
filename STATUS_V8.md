# STATUS V8 — Brand Convert manufacturer pricing

## Done
- `src/data/prices.ts`: USD list prices for all 129 catalog parts from official Axis/Armstrong Shopify JSON (2026-09-07). CAD = FX at read time.
- Prefs: `currency` on `foil-twin-quiver-ui-v1` (USD|CAD, default USD).
- UI: USD|CAD control in Brand Convert; per-buy prices; kit/list totals; footnote.
- Sanity: prices >= 0, CAD FX, currency round-trip.
- `SOURCES.md` Pricing section.

## CAD method
FX from mfr USD (not dealer CAD). BoC FXUSDCAD **1.3840** on **2026-09-04**.

## Counts
USD 129/129 · CAD (FX) 129/129 · unpriced 0

## Caveats
List prices not live cart quotes. Some Axis handles still use copy-of slugs (Fireball 1250, PRO 900, some Skinnys) but match official SKUs. Foil Drive Axis masts use mast-only variant.
