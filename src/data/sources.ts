import type { Source } from "./types";

export const RETRIEVED = "2026-09-03";
/** Retrieval date for the v2 mast catalog. */
export const MAST_RETRIEVED = "2026-09-04";
/** Retrieval date for the Code Foils catalog (v10). */
export const CODE_RETRIEVED = "2026-09-08";
/** Retrieval date for Kitesource.ca Code dealer prices. */
export const KITESOURCE_PRICE_RETRIEVED = "2026-09-08";

export function src(
  url: string,
  role: Source["role"],
  note?: string,
  retrieved: string = RETRIEVED,
): Source {
  return note
    ? { url, retrieved, role, note }
    : { url, retrieved, role };
}

export function mastSrc(
  url: string,
  role: Source["role"],
  note?: string,
): Source {
  return src(url, role, note, MAST_RETRIEVED);
}

export function codeSrc(
  url: string,
  role: Source["role"],
  note?: string,
): Source {
  return src(url, role, note, CODE_RETRIEVED);
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
  axisMasts: "https://axisfoils.com/collections/masts",
  axisAluminiumMasts: "https://axisfoils.com/collections/aluminium-masts",
  axisCarbonMasts: "https://axisfoils.com/collections/axis-foils-carbon-masts",
  axisProUhmMasts: "https://axisfoils.com/collections/pro-ultra-high-modulus-carbon-masts",
  axisAl19_1050: "https://axisfoils.com/products/19mm-aluminium-1050mm-foil-mast",
  axisAl19_900: "https://axisfoils.com/products/19mm-aluminium-900mm-foil-mast",
  axisAl19_820: "https://axisfoils.com/products/19mm-aluminium-820mm-foil-mast",
  axisAl19_750: "https://axisfoils.com/products/19mm-aluminium-750mm-foil-mast",
  axisAl19_680: "https://axisfoils.com/products/19mm-aluminium-680mm-foil-mast",
  axisAl19_600: "https://axisfoils.com/products/19mm-aluminium-600mm-foil-mast",
  axisAl19_450: "https://axisfoils.com/products/19mm-aluminium-450mm-foil-mast",
  axisPc900: "https://axisfoils.com/products/power-carbon-foil-mast-base-plate-90",
  axisPc820: "https://axisfoils.com/products/power-carbon-foil-mast-base-plate-82",
  axisPc750: "https://axisfoils.com/products/power-carbon-foil-mast-base-plate-75",
  axisPcHm1020: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-102",
  axisPcHm900: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-90",
  axisPcHm820: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-82",
  axisPcHm750: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-75",
  axisFatty900: "https://axisfoils.com/products/axis-power-carbon-fatty-mast-base-plate-90",
  axisFatty800: "https://axisfoils.com/products/axis-power-carbon-fatty-mast-base-plate-80",
  axisPro1050: "https://axisfoils.com/products/pro-ultra-high-modulus-carbon-1050",
  axisPro900: "https://axisfoils.com/products/copy-of-pro-ultra-high-modulus-carbon-900",
  axisPro800: "https://axisfoils.com/products/pro-ultra-high-modulus-carbon-800",
  axisPro720: "https://axisfoils.com/products/pro-ultra-high-modulus-carbon-720",
  axisKaiwi780: "https://axisfoils.com/products/kaiwi-ultra-high-modulus-mast-780",
  axisFdUhm800: "https://axisfoils.com/products/axis-ultra-high-modulus-carbon-integrated-foil-drive-mast-800",
  axisFdHm800: "https://axisfoils.com/products/axis-high-modulus-carbon-integrated-foil-drive-mast-800",
  armstrongMasts: "https://armstrongfoils.com/collections/masts",
  armstrongCarbonGuide:
    "https://armstrongfoils.com/blogs/resources/the-carbon-mast-range-explained",
  armstrongAlloyMast: "https://armstrongfoils.com/products/alloy-mast",
  armstrongMk2Carbon: "https://armstrongfoils.com/products/mk-ii-carbon-mast",
  /** Official product URL uses this spelling. */
  armstrongPerfMk2: "https://armstrongfoils.com/products/peformance-mk-ii-carbon-mast",
  armstrongPerfX: "https://armstrongfoils.com/products/performance-x-carbon-mast",
  armstrongFdAssist:
    "https://armstrongfoils.com/products/armstrong-foil-drive-foil-assist-integrated-carbon-mast",
  armstrongFdEfoil:
    "https://armstrongfoils.com/products/armstrong-foil-drive-e-foil-integrated-carbon-mast",
  axisLogo:
    "https://axisfoils.com/cdn/shop/files/AXIS_logo_web_400x.png?v=1678316363",
  armstrongWordmark:
    "https://armstrongfoils.com/cdn/shop/files/Armstrong-Wordmark.png?v=1712702441",
  codeHome: "https://codefoils.com",
  codeProducts: "https://codefoils.com/products/",
  codeS: "https://codefoils.com/product/s-series-front-wing/",
  codeR: "https://codefoils.com/product/r-series-front-wing/",
  codeX: "https://codefoils.com/product/x-series-front-wing/",
  codeKanga: "https://codefoils.com/product/kanga-series-front-wing/",
  codeArTail: "https://codefoils.com/product/ar-series-tail-wings/",
  codeRTail: "https://codefoils.com/product/r-series-tail-wing/",
  codeRaceTail: "https://codefoils.com/product/race-tails/",
  codeFuse: "https://codefoils.com/product/fuselage/",
  codeHmMast: "https://codefoils.com/product/high-modulus-mast/",
  codeUhmPlusMast: "https://codefoils.com/product/ultra-high-modulus-plus-mast/",
  codeBlackMast: "https://codefoils.com/product/black-series-mast/",
  codeAlloyMast: "https://codefoils.com/product/aluminium-mast/",
  codeFdMast: "https://codefoils.com/product/code-foils-x-foil-drive-integrated-mast/",
  codeStore: "https://store.codefoils.com",
  kitesourceCode: "https://kitesource.ca/collections/code-foils-canada",
} as const;
