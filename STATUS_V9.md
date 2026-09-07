# STATUS V9 — Brand Convert discoverability, kits, mast families

## Done
1. USD|CAD in Brand Convert header row (title / Prices / chevron); currency on foil-twin-quiver-ui-v1.
2. Collapsible Simplified + Fuller kits; sections.kit80 / sections.kit90 default true.
3. Mast family twin table in src/lib/mastFamilies.ts; nearestMast/rankMastTwins/convert pool use it.
4. Kit add/remove/reset session overlay; live KitTotal; incomplete-kit note; Reset kit restores algorithm.

## Mast map
axis-al-19↔arm-alloy; axis-pc↔arm-carbon-mk2; axis-pc-hm↔arm-perf-mk2; axis-fatty→arm-carbon-mk2; axis-pro-uhm↔arm-perf-x; axis-kaiwi→arm-perf-x; axis-fd-*→arm-fd-assist; arm-fd-efoil→axis-fd-uhm.

## Build / sanity
tsc + vite build pass; sanity pass (PCHM→perf-mk2, Pro/Kaiwi→perf-x).

## Caveats
Kit edits are session state (cleared when convert baseline changes). Reverse prefers PC/Pro over Fatty/Kaiwi.
