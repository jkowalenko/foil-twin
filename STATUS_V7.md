# Foil Twin STATUS V7

Quiver UI polish + rider-friendly copy. Matching, map colors/AR bands, progress ladder, convert 80/90 kit rules, and `foil-twin-quiver-v1` inventory schema unchanged.

## Changes
1. Named setups: Edit / Load in Twin / Remove stack vertically (column, ~6px gap, stretch). Mobile stays a full-width vertical stack under the label.
2. Gaps, Next to buy, Brand Convert collapse. Defaults: gaps + nextToBuy open, brandConvert closed. Prefs in `foil-twin-quiver-ui-v1` (`{ version: 1, sections: { gaps, nextToBuy, brandConvert } }`), not the inventory doc. Chevron + `aria-expanded` / `aria-controls`.
3. Rider copy: Twin/Map/Progress/Quiver/SetupBuilder notes drop matcher jargon. Convert headlines are Simplified kit / Fuller kit; tier notes and overlap lines no longer dump covering X/Y (N%). Kit selection logic unchanged.
4. Shared chrome polish: panel titles, chip/toggle hover + focus, empty states, collapse headers aligned with logos-only toggles.

## Verify
- npm run build: pass
- npm run sanity: pass (UI prefs parse + convert copy checks; 80/90 kit tests not weakened)

## Caveats
No live browser click-through in this environment. Collapse persistence is localStorage-only (same as inventory).
