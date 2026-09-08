import type { Brand, MastFamilyId } from "../data/types";
import { otherBrand } from "./format";

/**
 * Cross-brand mast class map used by Brand Convert / nearest-mast.
 * Length matching stays within the mapped class (not length-only across classes).
 *
 * alloy:        axis-al-19 / arm-alloy / code-alloy
 * entry-carbon: axis-pc (+fatty) / arm-carbon-mk2 / code-hm
 * hm-perf:      axis-pc-hm / arm-perf-mk2 / code-hm
 * uhm-pro:      axis-pro-uhm (+kaiwi) / arm-perf-x / code-uhm-plus (+code-black)
 * fd:           axis-fd-* / arm-fd-* / code-fd
 *
 * Code High Modulus (official product page: "Original Mast") sits in both
 * entry-carbon (when coming from Axis PC / Fatty / Armstrong Carbon Mk II) and
 * hm-perf (when coming from Axis PC-HM / Armstrong Performance Mk II). Reverse
 * from code-hm prefers hm-perf.
 *
 * Primary reverse targets when several families share a class:
 * - Axis: PC (not Fatty), PC-HM, PRO UHM (not Kaiwi), FD UHM (not HM FD)
 * - Armstrong: Carbon Mk II, Performance Mk II, Performance-X, Assist (not E-Foil)
 * - Code: Plus (not Black) in UHM class; High Modulus in both carbon classes
 */
export type MastClassId = "alloy" | "entry-carbon" | "hm-perf" | "uhm-pro" | "fd";

/** First listed family is the primary reverse target for that brand. */
export const MAST_CLASS_FAMILIES: Record<MastClassId, Record<Brand, MastFamilyId[]>> = {
  alloy: {
    axis: ["axis-al-19"],
    armstrong: ["arm-alloy"],
    code: ["code-alloy"],
  },
  "entry-carbon": {
    axis: ["axis-pc", "axis-fatty"],
    armstrong: ["arm-carbon-mk2"],
    code: ["code-hm"],
  },
  "hm-perf": {
    axis: ["axis-pc-hm"],
    armstrong: ["arm-perf-mk2"],
    code: ["code-hm"],
  },
  "uhm-pro": {
    axis: ["axis-pro-uhm", "axis-kaiwi"],
    armstrong: ["arm-perf-x"],
    code: ["code-uhm-plus", "code-black"],
  },
  fd: {
    axis: ["axis-fd-uhm", "axis-fd-hm"],
    armstrong: ["arm-fd-assist", "arm-fd-efoil"],
    code: ["code-fd"],
  },
};

/** Primary class when mapping FROM this family. code-hm prefers hm-perf on reverse. */
export const MAST_FAMILY_CLASS: Record<MastFamilyId, MastClassId> = {
  "axis-al-19": "alloy",
  "arm-alloy": "alloy",
  "code-alloy": "alloy",

  "axis-pc": "entry-carbon",
  "axis-fatty": "entry-carbon",
  "arm-carbon-mk2": "entry-carbon",

  "code-hm": "hm-perf",
  "axis-pc-hm": "hm-perf",
  "arm-perf-mk2": "hm-perf",

  "axis-pro-uhm": "uhm-pro",
  "axis-kaiwi": "uhm-pro",
  "arm-perf-x": "uhm-pro",
  "code-uhm-plus": "uhm-pro",
  "code-black": "uhm-pro",

  "axis-fd-hm": "fd",
  "axis-fd-uhm": "fd",
  "arm-fd-assist": "fd",
  "arm-fd-efoil": "fd",
  "code-fd": "fd",
};

function brandOfMastFamily(familyId: MastFamilyId): Brand {
  if (familyId.startsWith("axis-")) return "axis";
  if (familyId.startsWith("arm-")) return "armstrong";
  return "code";
}

export function mastClassOf(familyId: MastFamilyId): MastClassId {
  return MAST_FAMILY_CLASS[familyId];
}

/** All families on `toBrand` in the same class as `familyId`. */
export function twinMastFamilies(familyId: MastFamilyId, toBrand: Brand): MastFamilyId[] {
  const cls = MAST_FAMILY_CLASS[familyId];
  return MAST_CLASS_FAMILIES[cls][toBrand];
}

/**
 * Primary twin family on the target brand.
 * Omit `toBrand` to keep Axis ↔ Armstrong (Code defaults to Axis).
 */
export function twinMastFamily(familyId: MastFamilyId, toBrand?: Brand): MastFamilyId {
  const target = toBrand ?? otherBrand(brandOfMastFamily(familyId));
  return twinMastFamilies(familyId, target)[0];
}

/** Axis ↔ Armstrong (and Code → Axis) primary twins, for sanity / logs. */
export const MAST_FAMILY_TWIN: Record<MastFamilyId, MastFamilyId> = {
  "axis-al-19": "arm-alloy",
  "arm-alloy": "axis-al-19",

  "axis-pc": "arm-carbon-mk2",
  "arm-carbon-mk2": "axis-pc",

  "axis-pc-hm": "arm-perf-mk2",
  "arm-perf-mk2": "axis-pc-hm",

  "axis-fatty": "arm-carbon-mk2",

  "axis-pro-uhm": "arm-perf-x",
  "arm-perf-x": "axis-pro-uhm",

  "axis-kaiwi": "arm-perf-x",

  "axis-fd-hm": "arm-fd-assist",
  "axis-fd-uhm": "arm-fd-assist",
  "arm-fd-assist": "axis-fd-uhm",
  "arm-fd-efoil": "axis-fd-uhm",

  "code-alloy": "axis-al-19",
  "code-hm": "axis-pc-hm",
  "code-uhm-plus": "axis-pro-uhm",
  "code-black": "axis-pro-uhm",
  "code-fd": "axis-fd-uhm",
};
