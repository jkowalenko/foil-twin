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

## Brand marks (UI)

Retrieved **2026-09-04**. Used only to identify the two manufacturers in this matcher (nominative fair use). Files live in `public/brand/`. No claim of a trademark license.

| Brand | File | Official URL |
| --- | --- | --- |
| AXIS Foils | `public/brand/axis-logo.png` | https://axisfoils.com/cdn/shop/files/AXIS_logo_web_400x.png?v=1678316363 (site header / JSON-LD logo) |
| Armstrong Foils | `public/brand/armstrong-wordmark.png` | https://armstrongfoils.com/cdn/shop/files/Armstrong-Wordmark.png?v=1712702441 (site header wordmark) |

Armstrong's wordmark is black on transparent, so the UI sits it on a light chip rather than inverting (which would recolor the red triangle).

## Axis — masts

Retrieval date for every mast in `src/data/masts.ts`: **2026-09-04**.

Index: https://axisfoils.com/collections/masts (two pages of live products). Carbon collection: https://axisfoils.com/collections/axis-foils-carbon-masts. Aluminium collection: https://axisfoils.com/collections/aluminium-masts.

| Family | Official URLs | Published | Not published |
| --- | --- | --- | --- |
| 19mm Aluminium | Collection + product pages for 1050 / 900 / 820 / 750 / 680 / 600 / 450 mm (titles use cm: 105, 90, 82, 75, 68, 60, 45). Size chart image on the aluminium collection lists the same lengths. | length; 19 mm section; aluminium; usage notes | weight, chord |
| Power Carbon | https://axisfoils.com/products/power-carbon-foil-mast-base-plate-90 (and -82, -75) | 750 / 820 / 900 mm; one-piece carbon; 25% stiffer than 19mm alloy (PRO collection copy) | weight, thickness, chord |
| Power Carbon High Modulus | product pages -102 / -90 / -82 / -75 | 750 / 820 / 900 / 1020 mm; High Modulus carbon; 35% more bend resistance than 19mm aluminium | weight, thickness, chord |
| Power Carbon FATTY | https://axisfoils.com/products/axis-power-carbon-fatty-mast-base-plate-80 and -90 | 800 / 900 mm; 18.5 mm; Medium Modulus Carbon; longer chord / deeper fuse connection | weight, numeric chord |
| PRO Ultra High Modulus Carbon | collection https://axisfoils.com/collections/pro-ultra-high-modulus-carbon-masts + products 720 / 800 / 900 (slug still `copy-of-pro-ultra-high-modulus-carbon-900`) / 1050 | 720 / 800 / 900 / 1050 mm; UHM; 13.5 mm **bottom-section** thickness; 55% stiffer than 19mm alloy | weight. Collection body copy still says “3 sizes”; 720 is a live product |
| KAIWI UHM Uni Carbon | https://axisfoils.com/products/kaiwi-ultra-high-modulus-mast-780 | 780 mm; UHM uni carbon; rider ≤85 kg / span ≤100 cm (excl. Tempo) | thickness, chord, weight |
| Integrated Foil Drive HM / UHM | https://axisfoils.com/products/axis-high-modulus-carbon-integrated-foil-drive-mast-800 and ultra-high-modulus sibling | 800 mm; motor pod 15 cm below baseplate | weight |

**Not cataloged (no live SKU on 2026-09-04):** 16mm aluminium (mentioned in aluminium collection copy and on the size chart, but every `/products/16mm-aluminium-*` URL returned 404). Original carbon 760 / 860 / 960 mm (chart still hosted on the carbon collection; those SKUs are not in the current product list).

## Armstrong — masts

Retrieval date **2026-09-04**. Current collection (6 products): https://armstrongfoils.com/collections/masts. Range guide: https://armstrongfoils.com/blogs/resources/the-carbon-mast-range-explained. FAQ (rake 0.5° / 1.0°): https://armstrongfoils.com/blogs/resources/the-carbon-mast-range-faqs.

| Family | Official URL | Published |
| --- | --- | --- |
| Alloy Mast | https://armstrongfoils.com/products/alloy-mast | Sizes **58 / 72 / 85 cm**; 6061 aluminium; Alloy System only (not A+). Weight, thickness, chord **null** |
| Mk II Carbon Mast | https://armstrongfoils.com/products/mk-ii-carbon-mast | 655 / 725 / 795 / 865 mm; 15.8 mm; chord 116 mm; weights 1530 / 1780 / 1895 / 2150 g; 0° rake |
| Performance Mk II Carbon Mast | https://armstrongfoils.com/products/peformance-mk-ii-carbon-mast (official spelling) | 725 / 795 / 865 / 935 mm; 13.8 mm; chord 114 mm; weights 1740 / 1940 / 2070 / 2175 g; high modulus carbon. 725 page prints 0.5°. FAQ: 725/795 = 0.5°, 865/935 = 1.0° |
| Performance-X Carbon Mast | https://armstrongfoils.com/products/performance-x-carbon-mast | 725: 12.2 mm / 105.8 mm / 1650 g; 795: 12.25 / 106.8 / 1915 g; 865: 12.45 / 107.8 / 2045 g; 935: 12.75 / 108.8 / 2100 g; UHM carbon. Same rake split as Performance Mk II |
| Foil Drive Assist Integrated | https://armstrongfoils.com/products/armstrong-foil-drive-foil-assist-integrated-carbon-mast | Length **795 mm**, pod height **185 mm**. Weight null |
| Foil Drive E-Foil Integrated | https://armstrongfoils.com/products/armstrong-foil-drive-e-foil-integrated-carbon-mast | Length **795 mm**, pod height **650 mm**. Weight null |

Older A+ carbon (45–100 cm) and Performance Carbon Mk I sizes appear in leftover Shopify atom feeds; they are **not** on the current 6-product masts collection and were not added.


## Pricing (USD list + CAD via FX)

Retrieved **2026-09-07**. USD list prices from official manufacturer Shopify product / collection JSON only. CAD is **not** listed on Axis/Armstrong .com shops; UI CAD = USD × Bank of Canada FXUSDCAD daily average **1.3840** dated **2026-09-04** (https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=5). Labeled in-app as CAD est. from USD @ rate (date). Never invent round CAD list prices.

Data lives in `src/data/prices.ts` (`PART_PRICES_USD` + FX constants). Absent map entries are unpriced (`null`).

### Axis (https://axisfoils.com) — USD

| Family / kind | Product / collection sources used |
| --- | --- |
| Surge fronts | `/products/axis-surge-*-carbon-hydrofoil-wing` (+ `/collections/surge/products.json`) |
| ART v2 fronts | `/products/art-v2-1099`, `artv2-999`, `artv2-939`, `artv2-879`, `art-v2-819` |
| Spitfire fronts | `/products/spitfire-*` |
| Fireball fronts | `/products/axis-fireball-*-ultra-high-mod-carbon-hydrofoil-wing` (1250 uses the published copy-of handle with SKU AXFIREBALL1250) |
| Surf Skinny / Skinny / Progressive tails | matching `/products/*skinny*` and `*-progressive-carbon-rear-wing` pages |
| Black Advance+ fuses | `/products/black-*-advance-fuselage` (short/ultrashort/crazyshort/sillyshort) |
| 19mm Al / Power Carbon / PC HM / Fatty / PRO UHM / Kaiwi / Foil Drive masts | matching `/products/*mast*` pages; Foil Drive uses mast-only (no cover) variant prices |

### Armstrong (https://armstrongfoils.com) — USD

| Family / kind | Product sources used |
| --- | --- |
| UHA / HA / MA Mk II fronts | `/products/uha-front-foil`, `ha-front-foil`, `ma-mk-ii-front-foil` (variant prices) |
| Speed / Dart / Surf Mk II tails | `/products/speed-180`, `dart-140`, `dart-120-stabilizer`, `surf-mk-ii-stabilizer` |
| Titanium Core A+ fuses | `/products/titanium-carbon-fuselage` (50/60 cm variants) |
| Alloy / Mk II Carbon / Performance Mk II / Performance X / Foil Drive masts | `/products/alloy-mast`, `mk-ii-carbon-mast`, `performance-mk-ii-carbon-mast`, `performance-x-carbon-mast`, assist + e-foil integrated mast products |

Shopify collection JSON (`/collections/<handle>/products.json`) and product JSON (`/products/<handle>.js`) were the primary scrape paths; prices are manufacturer USD as published on those official stores.
