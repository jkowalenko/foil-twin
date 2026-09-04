import type { Source } from "./types";

export const RETRIEVED = "2026-09-03";

export function src(
  url: string,
  role: Source["role"],
  note?: string,
): Source {
  return note
    ? { url, retrieved: RETRIEVED, role, note }
    : { url, retrieved: RETRIEVED, role };
}

export const URLS = {
  axisHome: "https://www.axisfoils.com",
  axisSurge: "https://axisfoils.com/collections/surge",
  axisArtV2: "https://axisfoils.com/collections/axis-research-team-v2",
  axisArtV2_1099: "https://axisfoils.com/products/art-v2-1099",
  axisSpitfire: "https://axisfoils.com/collections/spitfire",
  axisFireball: "https://axisfoils.com/collections/will-be-fireball",
  axisSkinny: "https://axisfoils.com/collections/skinny-rear-wings",
  axisSkinnySurf: "https://axisfoils.com/collections/skinny-surf",
  axisProgressive: "https://axisfoils.com/collections/progressive-rear-wings",
  axisAdvancePlus: "https://axisfoils.com/collections/black-advance-fuselage",
  spitfireTableTranscribed:
    "https://foilit.de/axis/spitfire-front-wing/en",
  armstrongHome: "https://www.armstrongfoils.com",
  armstrongUha: "https://armstrongfoils.com/products/uha-front-foil",
  armstrongHa: "https://armstrongfoils.com/products/ha-front-foil",
  armstrongMa: "https://armstrongfoils.com/products/ma-mk-ii-front-foil",
  armstrongSpeed: "https://armstrongfoils.com/products/speed-180",
  armstrongDart140: "https://armstrongfoils.com/products/dart-140",
  armstrongDart120: "https://armstrongfoils.com/products/dart-120-stabilizer",
  armstrongSurfMk2: "https://armstrongfoils.com/products/surf-mk-ii-stabilizer",
  armstrongTcFuse: "https://armstrongfoils.com/products/titanium-carbon-fuselage",
  armstrongStabilizers: "https://armstrongfoils.com/collections/stabilizers",
  armstrongFronts: "https://armstrongfoils.com/collections/front-foils",
  dartSpecsDealer:
    "https://www.kitepower.com.au/products/armstrong-2023-stabiliser-tail-wing",
  speedSpecsDealer: "https://swiftfoiling.com/product/armstrong-speed-180/",
} as const;
