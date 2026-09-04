# Sources

Retrieval date for every part in `src/data/catalog.ts`: **2026-09-03**.

Primary sources are manufacturer sites. Where an official page hosts a spec **table image** rather than HTML numbers, those numbers were read from the table. Where Armstrong’s current product page names a stabilizer but does not print area/span/AR, the catalog uses consistent dealer transcriptions of Armstrong’s own spec sheet and labels them as such. Unpublished fields are `null`.

## Axis — fronts

| Family | Official URL | What was taken |
| --- | --- | --- |
| Surge | https://axisfoils.com/collections/surge | Family copy; spec table (span, chord, mean chord, actual area, volume, AR) for 1150, 1080, 1010, 950, 890, 830, 780, 740 |
| ART v2 | https://axisfoils.com/collections/axis-research-team-v2 | Family copy; spec table for 1099/999/939/879/819 (table spans 1100/1000/940/880/820 mm) |
| ART v2 | https://axisfoils.com/products/art-v2-1099 | Official size list with area + AR |
| Spitfire | https://axisfoils.com/collections/spitfire | Official size list 620–1180; spec table image on the page |
| Spitfire (table transcription) | https://foilit.de/axis/spitfire-front-wing/en | Complete numeric transcription of the AXIS Spitfire table (including 670 and 620). Cross-checked against overlapping sizes on other AXIS dealer pages |
| Fireball | https://axisfoils.com/collections/will-be-fireball | Spec table for 1750–880; body copy with 1070/1000/940/880 area+AR; 1500 AR 17 / 1750 AR 20; fuse/tail pairing notes |

Fireball 880 chord is recorded as **93 mm** from the table’s 3.66 in (not 193 mm).

## Axis — tails

| Family | Official URL | Sizes |
| --- | --- | --- |
| Surf Skinny | https://axisfoils.com/collections/skinny-surf | 340/50, 320/48, 300/45, 280/43 (span, chord, actual area, AR) |
| Skinny | https://axisfoils.com/collections/skinny-rear-wings | 365/55, 362/50, 360/45, 359/40, 358/35, 358/30, 358/25, 250/20. AXIS notes 358/30, 358/25, 250/20 are downwind-only / not warranted for winging |
| Progressive | https://axisfoils.com/collections/progressive-rear-wings | 475/68 through 250/56 (span, chord, actual area, AR, 1.5° AOA) |

## Axis — fuselages

| Family | Official URL | Published |
| --- | --- | --- |
| Black Advance+ | https://axisfoils.com/collections/black-advance-fuselage | Short **700 mm**, Ultrashort **640 mm**, Crazyshort **600 mm**, Sillyshort **560 mm**. Mast **60 mm** further forward than original Black Standard (40 mm further than Advance 20). Zinc anode; Tef-Gel hardware. Psychoshort 520 mm and Fatty variants exist but are out of v1 scope |

**Not published** on that page (stored `null`): weight, mast-to-front mm, mast-to-tail mm, numeric tail lever.

## Armstrong — fronts

Official family names from https://armstrongfoils.com/collections/front-foils.

| Family | Official URL | Sizes / numbers |
| --- | --- | --- |
| UHA Front Foil | https://armstrongfoils.com/products/uha-front-foil | 570, 670, 770, 870, 970, 1070, 1270 — area, span, AR 12.6, weight (g) |
| HA Front Foil | https://armstrongfoils.com/products/ha-front-foil | 480, 580, 680, 780, 880, 980, 1080, 1180 — area, span, AR. Current page: HA680 = 828 mm / AR 10.0; HA780 = 877 mm / AR 9.86 (older 2024 tables differed) |
| MA Mk II Front Foil | https://armstrongfoils.com/products/ma-mk-ii-front-foil | 490, 590, 690, 790, 890, 990, 1190, 1390 — area, span, AR 8.0 |

Armstrong does **not** currently list a UHF family. v1 uses **UHA**.

HA and MA Mk II **weights** are not on the official product pages (null).

## Armstrong — tails

Current official stabilizer index: https://armstrongfoils.com/collections/stabilizers

| Family | Official URL | Official page gives | Numbers used |
| --- | --- | --- | --- |
| Speed 180 | https://armstrongfoils.com/products/speed-180 | Product exists; high-aspect outline; A+ System | Area 180 cm², span 400 mm, AR 9 from dealer transcription of Armstrong specs, e.g. https://swiftfoiling.com/product/armstrong-speed-180/ |
| Dart 140 | https://armstrongfoils.com/products/dart-140 | Product exists; high-aspect outline | 140 cm², 348 mm, AR 8.7 from https://www.kitepower.com.au/products/armstrong-2023-stabiliser-tail-wing |
| Dart 120 | https://armstrongfoils.com/products/dart-120-stabilizer | Product exists; decreased area / AR / span vs 140 | 120 cm², 300 mm, AR 7.3 from the same dealer sheet |
| Surf Mk II | https://armstrongfoils.com/products/surf-mk-ii-stabilizer | Sizes **130 / 170 / 200 cm²**; designed with MA Mk II | Span, AR, weight **null** — not printed on the official page or a reliable manufacturer table |

v1 includes every size currently published on armstrongfoils.com for Speed, Dart, and Surf. Older Surf 205 is previous-generation and not on the current stabilizer collection.

## Armstrong — fuselages

| Family | Official URL | Published |
| --- | --- | --- |
| Titanium Core A+ | https://armstrongfoils.com/products/titanium-carbon-fuselage | Sizes **50 cm / 60 cm / 70 cm**. Construction: titanium rod core wrapped in machined carbon; hexagonal front connection; polycarbonate pro shims. v1 includes 50 and 60 |

**Not published** on that page: weight, mast-to-front, tail lever. Retailer pages sometimes quote TC50 340 g / TC60 407 g; those are **not** copied into the catalog because they are not on the manufacturer page.

## Home pages

- https://www.axisfoils.com
- https://www.armstrongfoils.com
