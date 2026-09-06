# Match notes

Sanity check of the v1 matcher against published specs. Retrieved **2026-09-03**. Run `npm run sanity` to reprint.

Scores are 0–100. Front is 62% of a complete-setup score, tail 23%, fuse 15%. Null dimensions are skipped.

The Twin page lists a complete setup only when the **front wing** pair is ≥ 75% (`MIN_FRONT_TWIN`). Overall score is still shown and used to rank.

Map part-compare only pairs other-brand fronts in the same AR class (`arClass()`): carve AR < 9.0, mid 9.0 ≤ AR < 11.5, high AR ≥ 11.5, and only if the front score is ≥ 66% (`MIN_MAP_FRONT`). Null AR is excluded from cross-class pairing. Twin / Quiver ranking is otherwise unchanged. Progress now ladders small → bigger by skill (fuse/tail, then one-size front, then related family) while staying strict-forward on the goal.

## What the matcher thinks is close

### Front-only (the part that should be “obvious”)

| From | Nearest other brand | Score | Why it looks right |
| --- | --- | --- | --- |
| Axis ART v2 879 (790 cm², AR 9.98, 880 mm) | Armstrong HA 780 (780 cm², AR 9.86, 877 mm) | **97%** | Almost the same area, span, and AR. This is the cleanest pair in the catalog. |
| Axis Fireball 1070 (877 cm², AR 13.07, 1070 mm) | Armstrong UHA 870 (870 cm², AR 12.6, 1047 mm) | **93%** | High-AR glide tools with matched area. Fireball is a touch higher AR. |
| Axis Fireball 1000 (773 / 12.95 / 1000) | Armstrong UHA 770 (770 / 12.6 / 985) | **95%** | Same story one size down. |
| Axis Surge 950 (949 / 9.52 / 950) | Armstrong HA 980 (980 / 9.68 / 974) | **91%** | Surge’s ~9.5 AR sits on the HA, not the MA. |
| Axis Spitfire 840 (1006 / 7.14 / 840) | Armstrong MA Mk II 990 (990 / 8.0 / 906) | **83%** | Closest carve pair. Spitfire is lower AR / shorter span — MA will feel a bit more locked in roll. |
| Armstrong HA 880 (880 / 9.68 / 923) | Axis ART v2 939 (900 / 10.0 / 940) | **92%** | All-round lane. Surge 890 (835 / 9.50) is the surf-led runner-up at 86%. |
| Armstrong UHA 770 | Axis Fireball 1000 | **95%** | See above. |
| Armstrong MA Mk II 890 (890 / 8.0 / 860) | Axis Spitfire 780 (902 / 6.87 / 780) | ~79% | Area matches; AR does not. There is no Axis ~8.0 AR wing in v1, so this is a compromise. |

### Complete setups

| You ride | Top twin | Notes |
| --- | --- | --- |
| ART v2 879 + Ultra Short + Skinny 360/45 | HA 780 + TC60 + **Speed 180** (88%) | Front is a slam dunk. Skinny maps to Speed. Ultra Short 640 vs TC60 600 is “a bit shorter on Armstrong.” |
| Fireball 1070 + Short + Skinny 359/40 | UHA 870 + TC60 + Speed 180 (78%) | Front is excellent. Fuse score is weaker: Axis Short is 700 mm vs TC60 600 mm — honestly longer / more stable on Axis. |
| Spitfire 840 + Crazy Short + Progressive 300/61 | MA 990 + TC60 + **Dart 140** (85%) | Progressive maps to Dart. Crazy Short 600 = TC60 600 on overall length (mast geometry still differs). |
| Surge 890 + Silly Short + Surf Skinny 320/48 | HA 880 + TC60 + **Surf 130** (87%) | Role map works. Silly Short 560 is closer to TC50 on paper; TC60 still wins overall because HA 880 + Surf 130 is the better complete package. The TC50 variant is #3. |
| HA 880 + TC60 + Speed 180 | ART v2 939 + Crazy Short + Skinny 365/55 (92%) | Reverse of the all-round pair. Skinny 365/55 (168 cm²) is the closest published Skinny to Speed 180 (180 cm²). |
| UHA 870 + TC60 + Dart 140 | Fireball 1070 + Crazy Short + Progressive 300/61 (91%) | Dart → Progressive. |
| MA 890 + TC50 + Surf 170 | Spitfire 780 + Silly Short + Surf Skinny 340/50 (77%) | Honest: this is the weakest “known” pair. MA AR 8 vs Spitfire AR ~6.9, and Surf Mk II span/AR are unpublished so tail scoring is area + role only. |

### Progression sample

ART v2 879 + Ultra Short + Skinny 360/45, wing, more speed — **strict-forward** only (never larger area). Carousel is **small → bigger**, capped by skill. Fuse/tail count as a forward step when they move the goal (smaller/speed-role tail for speed; shorter fuse for tighter turns; longer fuse for glide).

**Learning** (2 slides — no family jump, so not padded to 3):

1. Same front, smaller Skinny **359/40** — **small · tail**. Twin: HA 780 + TC60 + Speed 180.
2. Stay in ART v2, drop to **819** — **medium · front (one size)** (790 → 647 cm²). Twin: HA 680 + TC60 + Speed 180.

Slide 1 is not Fireball. Learning never gets a family leap.

**Comfortable:**

1. Skinny **359/40** — small tail step.
2. ART v2 **819** — one size down, same family.
3. **Fireball 1000** (773 cm², AR 12.95) — related higher-speed family at similar area. Twin: UHA 770 + TC60 + Speed 180.

**Pushing:** slides 1–2 same as comfortable; slide 3 is **Fireball 880** (604 cm², AR 12.82) — the same family leap, further down in area.

A Fireball with *more* area than 790 cm² is not recommended for this goal. Recommendations are not padded with backwards moves or with jumps that are too big for the rider level.

## Parts we could not source (null in the catalog)

| Part | Missing | Consequence |
| --- | --- | --- |
| Axis Advance+ fuselages | Weight, mast-to-front mm, tail-lever mm | Fuse matching is **overall length only**, plus the published “mast 60 mm further forward than Standard” note in the why-text |
| Armstrong TC50 / TC60 | Weight, mast-to-front, tail lever | Same. Retailer pages sometimes quote 340 g / 407 g; not copied because they are not on armstrongfoils.com |
| Armstrong Surf Mk II 130 / 170 / 200 | Span, AR, weight | Tail compare uses **area + role** only |
| Armstrong HA, MA Mk II | Weight | Front matching never uses weight anyway |
| Armstrong Speed / Dart numeric tables | Not on current official product pages | Area/span/AR taken from consistent dealer transcriptions of Armstrong sheets; labelled `dealer-transcription` in the catalog |
| Axis Spitfire table PNG | Hard to OCR (dark-on-dark) | Numbers taken from foilit.de’s transcription of that official table; overlapping sizes match other AXIS dealers |
| Armstrong **UHF** | Family does not exist on armstrongfoils.com | Catalog uses official **UHA Front Foil** |
| Axis Advance+ Crazy Short length | AXIS collection says **600 mm**; some EU dealers print 610 mm | Catalog uses AXIS |

## Manufacturer language vs the tail heuristic

Kept the requested map:

- Skinny ≈ Speed (low drag, glide, ART PRO / Fireball pairing language)
- Progressive ≈ Dart (turning, looser, carve)
- Skinny Surf ≈ Surf Mk II (surf / yaw / roll)

Armstrong also says some UHA riders use the **Surf** stabilizer for a tighter radius, so a Fireball/UHA rider on a Surf tail is a real-world mix, not a matcher bug. Role is a bonus, not a hard filter.
