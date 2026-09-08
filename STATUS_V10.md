# STATUS V10 — Code Foils as third manufacturer

## Done
1. `Brand` is `axis | armstrong | code`. Catalog + matcher + Twin / Map / Progress / Quiver all three-way.
2. Official Code catalog (retrieved **2026-09-08** from codefoils.com): S 9 / R 7 / X 7 / Kanga 4 fronts; AR 6 / R-tail 4 / Race 2 tails; 5 fuses (length from front of mast); Original HM / Plus / Black / Alloy / FD masts.
3. Twin: logos-only ride brand (3) + target brand (other brands only). `rankTwins(..., { targetBrand })`. Floor still `MIN_FRONT_TWIN` 75, weights 62/23/15.
4. Map: Code fronts plotted; 3 legend rows (logo + family swatches); Code greens `#52b788` / `#2d6a4f` / `#95d5b2` / `#1b4332`.
5. Progress: Code familyShift X→S→R (speed/glide) and R→S→X (carve). Kanga stays same-family size steps.
6. Quiver: BrandMini 3 logos; Brand convert target is selectable; `majorityBrand` 3-way; `brandConvert(doc, include?, toBrand?)`.
7. Mast class map (length in class): alloy / entry-carbon / HM-Perf / UHM-Pro / FD. Axis↔Armstrong primary twins unchanged. Null Code prices show em-dash.

## Catalog (Code)
Fronts: 500S–1725S AR 9.5; 600R–1250R AR 13.0; 700X–1195X AR 8.2; Kanga 1390/1600/1870/2220. Chord/weight/volume null.
Tails: AR surf AR 8.64; R-tail speed AR 10.8; Race 100/119 speed.
Fuses: 2XS 420 … Large 540 mm (`familyOfficial`: Code Fuselage).
Masts: HM 750/800/850; Plus 750/800/850/950; Black 750/800/850 (13.6/14.0/14.2 mm); Alloy 750/800 (18.7 / 120); FD 780 mm × 11 cm and 17 cm pods, `motorIntegrated`.

## Unpriced
Code.com does not sell foil parts online in USD (apparel AU-only). All 58 Code SKUs are `null`. Axis/Armstrong USD + BoC FXUSDCAD **1.3840** dated **2026-09-04** unchanged.

## Mast map
alloy: axis-al-19 / arm-alloy / code-alloy
entry-carbon: axis-pc (+fatty) / arm-carbon-mk2 / code-hm
HM/Perf: axis-pc-hm / arm-perf-mk2 / code-hm
UHM/Pro: axis-pro-uhm (+kaiwi) / arm-perf-x / code-uhm-plus (+code-black)
FD: axis-fd-* / arm-fd-* / code-fd

## Build / sanity
`npm run build` and `npm run sanity` pass. Axis↔Armstrong twins, 80/90 kits, mast family pairs, quiver key `foil-twin-quiver-v1` unchanged.

## Caveats
Code fuse length is official “from front of mast”, not a 1:1 overall-length twin of Axis Advance+ / Armstrong TC. Race Tails numbers are from the official product page as retrieved 2026-09-08. No Code list prices were invented.
