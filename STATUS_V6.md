# Foil Twin STATUS V6

Map label pointer-events, shared sidebar, Quiver logos/edit/sizeLabel/tap-to-add/gaps-only.

## Fixes
1. Map selected label+halo: pointer-events none; optional left-flip.
2. Twin/Progress/Quiver share --sidebar-w minmax(320px,400px); Map unchanged.
3. Quiver Add/Edit + BrandMini logos-only.
4. Named setups Edit/Save/Cancel via upsertNamedSetup.
5. PartPicker chips sizeLabel only (Surge 950); area in title tooltip.
6. Tap-to-add hint, +/check affordances, stronger owned state.
7. analyzeGaps + Gaps UI: missing only; have always [].

## Verify
- npm run build: pass
- npm run sanity: pass

## Caveats
QuiverGap.have stays on type but always empty. Map hover not live-browser tested.
