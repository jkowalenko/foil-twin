Build a local web app called **Foil Twin** in the current directory (/workspace/projects/foil-twin).

### Product
A foil setup matcher for a rider who owns or shops Axis and Armstrong. Not a brochure. The point is: look at one complete setup (front wing + fuselage + tail) on Axis and see the equivalent Armstrong setup (and reverse), then get a next-setup recommendation as they progress.

### Catalog to include (these families only for v1)

**Axis front wings:** Surge, ART V2 (Art V2), Spitfire, Fireball — every published size in each family.
**Axis tails:** Skinny Surf, Skinny, Progressive — every published size.
**Axis fuselages:** Advanced+ 60 line (and Advanced Plus if that is the same family): Short, Ultra Short, Crazy Short, Silly Short. Include published length, mast position, tail lever, weight, construction if listed.

**Armstrong front wings:** UHF/UHA, HA, MA Mk2 (Mark 2) — every published size in each family. Use the official family names from armstrongfoils.com.
**Armstrong tails:** Speed, Dart, Surf — every published size.
**Armstrong fuselages:** Titanium Core A+ specifically the 60 cm and 50 cm versions. Include published length, geometry, weight, construction.

### Data rules (critical)
- Use live web search and fetch manufacturer pages. Primary sources: https://www.axisfoils.com and https://www.armstrongfoils.com (and their product/spec pages, PDFs, tech sheets).
- Record source URL + retrieval date on every part.
- NEVER invent numeric specs. If a number is not published, set it null and add a note. Matching must skip nulls rather than hallucinate.
- Normalize units in JSON: area_cm2, span_mm, aspect_ratio, chord_mm if known, weight_g if known, fuse_length_mm, and any published mast-to-front / mast-to-tail / tail lever.
- Write the catalog as TypeScript/JSON in the repo (e.g. src/data/catalog.ts) plus SOURCES.md listing every URL used.

### App features
1. **Setup builder.** Pick brand, front family+size, fuselage, tail. Show the spec stack for that complete setup.
2. **Twin finder.** Given a complete Axis setup, rank Armstrong equivalents (front+fuse+tail) and vice versa. Score using:
   - Front: area (log scale), span, aspect ratio
   - Tail role mapping (starting heuristic, tune if manufacturer language disagrees): Axis Skinny ≈ Armstrong Speed; Axis Progressive ≈ Armstrong Dart; Axis Skinny Surf ≈ Armstrong Surf. Still score tail area/span/AR.
   - Fuselage: overall length and tail lever / mast position if published; Axis Short–Silly Short vs Armstrong A+ 60 vs 50.
   - Explain WHY in plain rider language (e.g. “same-ish area, higher AR so more glide, shorter fuse so looser”).
3. **Map.** Scatter or comparable chart of all fronts (area vs AR and/or area vs span), color by family, click to highlight nearest other-brand matches.
4. **Progression.** Inputs: current setup, rider level (learning / comfortable / pushing), discipline (wing, surf/prone, downwind, wake, race), goal (more speed, more lift/low-end, tighter turns, more glide, smaller size). Output 1–3 next setups on the SAME brand and the closest other-brand twin for the top pick. Heuristics: smaller area → more speed/less lift; higher AR → more glide/less roll; shorter fuse → more maneuverable/less stable; smaller tail → looser yaw. Be honest when the jump is big.
5. **Part compare.** Open any one Axis wing next to similar Armstrong wings by spec even without a full setup.

### UX
- Fast, beautiful, dark water/foil aesthetic. Desktop-first, usable on phone.
- Three primary views: Map, Twin, Progress.
- No login. No backend. Static data.
- Show source/disclaimer: specs from manufacturers; feel still varies by mast, board, rider weight, and conditions.

### Tech
- Vite + React + TypeScript. Keep it simple. No auth, no DB.
- `npm install && npm run dev` must work.
- Add a README with how to run and how matching works.
- Do not deploy, do not git push, do not add secrets.

### Done means
- App runs locally.
- Catalog covers the listed families with sourced specs or explicit nulls.
- Twin + progression views work on real data.
- SOURCES.md and README.md exist.

Research first (official pages), then implement, then sanity-check a few known pairings in a short MATCH_NOTES.md (what the matcher thinks is close, and any parts you could not source).
