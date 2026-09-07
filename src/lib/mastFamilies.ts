import type { MastFamilyId } from "../data/types";

/**
 * Explicit Axis ↔ Armstrong mast family twins for Brand Convert / nearest-mast.
 * Length matching stays within the mapped family (not length-only across classes).
 *
 * Primary reverse targets when several Axis families share one Armstrong family:
 * - arm-carbon-mk2 ← axis-pc (Fatty also maps → Carbon Mk II)
 * - arm-perf-x ← axis-pro-uhm (Kaiwi also maps → Performance X)
 * - arm-fd-assist ← axis-fd-uhm (HM FD also maps → Assist)
 */
export const MAST_FAMILY_TWIN: Record<MastFamilyId, MastFamilyId> = {
  "axis-al-19": "arm-alloy",
  "arm-alloy": "axis-al-19",

  "axis-pc": "arm-carbon-mk2",
  "arm-carbon-mk2": "axis-pc",

  "axis-pc-hm": "arm-perf-mk2",
  "arm-perf-mk2": "axis-pc-hm",

  /** Fatty → entry carbon / thicker section class */
  "axis-fatty": "arm-carbon-mk2",

  "axis-pro-uhm": "arm-perf-x",
  "arm-perf-x": "axis-pro-uhm",

  /** Kaiwi shares Performance X with Pro */
  "axis-kaiwi": "arm-perf-x",

  "axis-fd-hm": "arm-fd-assist",
  "axis-fd-uhm": "arm-fd-assist",
  "arm-fd-assist": "axis-fd-uhm",

  /** E-foil motor mast → Axis FD UHM (closest motor-integrated twin) */
  "arm-fd-efoil": "axis-fd-uhm",
};

export function twinMastFamily(familyId: MastFamilyId): MastFamilyId {
  return MAST_FAMILY_TWIN[familyId];
}
