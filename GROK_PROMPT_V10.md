# Foil Twin V10 – Add Code Foils as third manufacturer

Implement fully in /workspace/projects/foil-twin on main. Never invent manufacturer specs. Prefer official Code pages; dealer pages only as secondary transcription labeled dealer-transcription (SOURCES.md discipline).

When done: npm run build and npm run sanity must pass. Write STATUS_V10.md. Do NOT commit or push (parent will ship).

## Product goal
Expand Brand to axis | armstrong | code.

## Official Code catalog (retrieval 2026-09-08) – USE THESE NUMBERS

Primary: https://codefoils.com/products/

### Fronts - S Series ((code-s, AR 9.5)) https://codefoils.com/product/s-series-front-wing/
500S 695/500/9.5; 615S 765/615/9.5; 720S 830/720/9.5; 850S 900/850/9.5; 980S 965/980/9.5; 1130S 1035/1130/9.5; 1300S 1115/1300/9.5; 1540S 1210/1540/9.5; 1725S 1280/1725/9.5

### R Series ((code-r, AR 13.0)) https://codefoils.com/product/r-series-front-wing/
600R 880/600/13; 680R 935/680/13; 770R 1000/770/13; 860R 1050/860/13; 960R 1115/960/13; 1075R 1180/1075/13; 1250R 1275/1250/13

### X Series ((code-x, AR 8.2)) https://codefoils.com/product/x-series-front-wing/
700X 755/700/8.2; 740X 780/740/8.2; 810X 814/810/8.2; 890X 852/890/8.2; 985X 896/985/8.2; 1085X 940/1085/8.2; 1195X 987/1195/8.2

### Kanga ((code-kanga)) — INCLUDE — https://codefoils.com/product/kanga-series-front-wing/
1390 1300/1390/12.1; 1600 1300/1600/10.6; 1870 1300/1870/9.1; 2220 1700/2220/13.0

Chord/weight/volume: null unless on official page.

### Tails - AR Series ((code-ar, role surf, AR 8.64)) https://codefoils.com/product/ar-series-tail-wings/
142AR 340/142; 150AR 360/150; 158AR 380/158; 166AR 400/166; 175AR 420/175; 188AR 450/188

### R Series tails ((code-r-tail, role speed, AR 10.8)) https://codefoils.com/product/r-series-tail-wing/
110R 340/110; 120R 360/120; 135R 380/135; 151R 400/151

### Race tails ((code-race, role speed)) https://codefoils.com/product/race-tails/
Race 100: 399/100/16.3; Race 119: 400/119/14.8

### Fuselages (https://codefoils.com/product/fuselage/)
Five lengths, 30mm steps. Official "Length from front of mast" — store as fuse_length_mm. 2XS 420; X-Small 450; Small 480; Medium 510; Large 540. familyOfficial: Code Fuselage.

### Masts
- Original HM (code-hm): https://codefoils.com/product/high-modulus-mast/ — 750/800/850
- UHM Plus (code-uhm-plus): https://codefoils.com/product/ultra-high-modulus-plus-mast/ — 750/800/850/950
- Black Series (code-black): https://codefoils.com/product/black-series-mast/ — 750/800/850; thickness 13.6/14.0/14.2; INCLUDE
- Aluminium (code-alloy): https://codefoils.com/product/aluminium-mast/ — 750/800; thickness 18.7; chord 120
- FD Integrated (code-fd): https://codefoils.com/product/code-foils-x-foil-drive-integrated-mast/ — 780mm with 11cm and 17cm pod; motorIntegrated true

## Prices
Code.com does NOT sell foil parts online with USD (apparel AU-only). Leave Code parts unpriced (null). Keep Axis/Armstrong prices + BoC FXUSDCAD 1.3840 dated 2026-09-04. Document in SOURCES.

## Logo
Already in public/brand/code-wordmark.png and code-wordmark-light.png. Update BrandMark like Armstrong (dual img). Nominative fair use in SOURCES.

## Types / data
1. Brand = "axis" | "armstrong" | "code"
2. Extend FrontFamilyId / TailFamilyId / MastFamilyId with Code ids.
3. Add parts to catalog.ts / masts.ts / sources.ts. Ids: code-s-850, code-r-860, code-x-810, code-kanga-1600, code-ar-158, code-rtail-120, code-race-100, code-fuse-xs, code-hm-800, code-uhm-plus-850, code-black-800, code-alloy-750, code-fd-780-11, code-fd-780-17.
4. Update FRONT_FAMILY_ORDER, TAIL_FAMILY_ORDER, MAST_FAMILY_ORDER, FAMILY_COLOR, FAMILY_LABEL.
5. Map colors — Code green shades: code-s #52b788, code-r #2d6a4f, code-x #95d5b2, code-kanga #1b4332.
6. Document URLs + date 2026-09-08 in SOURCES.md and sources.ts.

## Matching / Twin UX (3 brands)
Binary otherBrand() is not enough.


### Twin
- Logos-only ride brand + target brand selectors (cannot be the same).
- Title "{Target} twin setups".
- Keep MIN_FRONT_TWIN 75 and weights 62/23/15.
- rankTwins(from, limit, { minFrontScore, targetBrand? }) — twin into selected target brand.
- SetupBuilder: 3 logo buttons for ride brand; TwinView: target-brand logo picker (other brands only).

### Family affinity
- Code X (8.2) <-> Spitfire / MA Mk II
- Code S (9.5) <-> Surge / ART v2 / HA
- Code R (13) <-> Fireball / UHA
- Kanga: Progress mostly same-family size steps; AR mid-high
Update speedFamilyRank / familyShift for Code: X->S->R speed/glide; R->S->X carve.

### Tail roles
AR ~= surf; R-tail ~= speed; Race ~= speed.

### Map
Plot Code fronts; 3 legend rows with logo + family swatches.

### Progress
Works for Code; familyShift within Code as above.

### Quiver
Code in pickers (BrandMini 3 logos). Brand convert from majority to selectable target. majorityBrand 3-way. brandConvert(doc, include?, toBrand?).

### Mast families (3-brand class map)
alloy: axis-al-19 / arm-alloy / code-alloy
entry-carbon: axis-pc (+fatty) / arm-carbon-mk2 / code-hm
HM/Perf: axis-pc-hm / arm-perf-mk2 / code-hm
UHM/Pro: axis-pro-uhm (+kaiwi) / arm-perf-x / code-uhm-plus (+code-black)
FD: axis-fd-* / arm-fd-* / code-fd
nearestMast picks nearest length in mapped class for selected target brand. Keep Axis<->Armstrong equivalent.

### Convert kits / pricing / kit edit
Keep working for any from->to including Code. Null prices show em-dash.

## UI
Header: three logos or Axis / Armstrong / Code. Footer: codefoils.com. Dark+light Code wordmark. CSS on-code.

## Sanity
1. Code catalog presence counts
2. Twin from/to with targetBrand (Axis->Code, Code->Armstrong, etc.)
3. Map 3 legend rows / Code greens
4. Mast map Code<->others
5. Convert kit >=1 each kind involving Code
6. Existing Axis<->Armstrong still pass

## Constraints
No invented specs/prices. Preserve foil-twin-quiver-v1. Do not weaken 80/90. Do not commit.

## Final reply
Code lines/sizes cataloged; unpriced gaps; Twin UX; Map colors; mast map; build/sanity; caveats.
