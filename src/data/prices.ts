/**
 * Manufacturer list prices (USD) for catalog parts.
 * Retrieved 2026-09-07 from official Axis / Armstrong Shopify product JSON.
 * CAD is estimated at read time via Bank of Canada FX (never invented list CAD).
 * FX: 1 USD = 1.384 CAD (BoC daily average 2026-09-04).
 * Missing / unfound SKUs are absent from the map (treated as null).
 * Code Foils does not sell foil parts online in USD (apparel AU-only on store.codefoils.com);
 * every Code catalog id is unpriced (null).
 */

export const PRICE_RETRIEVED = "2026-09-07";
export const FX_USD_TO_CAD = 1.384;
export const FX_DATE = "2026-09-04";
export const FX_SOURCE = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=5";
export const FX_SOURCE_LABEL = "Bank of Canada FXUSDCAD daily average";

export type PartPrice = {
  /** Official manufacturer USD list price. */
  usd: number;
  /** Official product page used for the USD figure. */
  sourceUrl: string;
  note?: string;
};

/** USD list prices keyed by catalog part id. Absent => unpriced. */
export const PART_PRICES_USD: Record<string, PartPrice> = {
  "arm-alloy-58": { usd: 109.99, sourceUrl: "https://armstrongfoils.com/products/alloy-mast", note: "variant 58cm" },
  "arm-alloy-72": { usd: 119.99, sourceUrl: "https://armstrongfoils.com/products/alloy-mast", note: "variant 72cm" },
  "arm-alloy-85": { usd: 129.99, sourceUrl: "https://armstrongfoils.com/products/alloy-mast", note: "variant 85cm" },
  "arm-cmk2-655": { usd: 899.99, sourceUrl: "https://armstrongfoils.com/products/mk-ii-carbon-mast", note: "variant 655mm" },
  "arm-cmk2-725": { usd: 949.99, sourceUrl: "https://armstrongfoils.com/products/mk-ii-carbon-mast", note: "variant 725mm" },
  "arm-cmk2-795": { usd: 999.99, sourceUrl: "https://armstrongfoils.com/products/mk-ii-carbon-mast", note: "variant 795mm" },
  "arm-cmk2-865": { usd: 1049.99, sourceUrl: "https://armstrongfoils.com/products/mk-ii-carbon-mast", note: "variant 865mm" },
  "arm-dart-120": { usd: 289.99, sourceUrl: "https://armstrongfoils.com/products/dart-120-stabilizer" },
  "arm-dart-140": { usd: 289.99, sourceUrl: "https://armstrongfoils.com/products/dart-140" },
  "arm-fd-assist-795": { usd: 1999.99, sourceUrl: "https://armstrongfoils.com/products/armstrong-foil-drive-foil-assist-integrated-carbon" },
  "arm-fd-efoil-795": { usd: 1999.99, sourceUrl: "https://armstrongfoils.com/products/armstrong-foil-drive-e-foil-integrated-carbon-mast" },
  "arm-ha-1080": { usd: 949.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA1080" },
  "arm-ha-1180": { usd: 989.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA1180" },
  "arm-ha-480": { usd: 799.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA480" },
  "arm-ha-580": { usd: 799.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA580" },
  "arm-ha-680": { usd: 819.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA680" },
  "arm-ha-780": { usd: 849.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA780" },
  "arm-ha-880": { usd: 879.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA880" },
  "arm-ha-980": { usd: 909.99, sourceUrl: "https://armstrongfoils.com/products/ha-front-foil", note: "variant HA980" },
  "arm-ma-1190": { usd: 989.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 1190cm2" },
  "arm-ma-1390": { usd: 1049.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 1390cm2" },
  "arm-ma-490": { usd: 799.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 490cm2" },
  "arm-ma-590": { usd: 819.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 590cm2" },
  "arm-ma-690": { usd: 849.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 690cm2" },
  "arm-ma-790": { usd: 879.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 790cm2" },
  "arm-ma-890": { usd: 909.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 890cm2" },
  "arm-ma-990": { usd: 949.99, sourceUrl: "https://armstrongfoils.com/products/ma-mk-ii-front-foil", note: "variant 990cm2" },
  "arm-pmk2-725": { usd: 1649.99, sourceUrl: "https://armstrongfoils.com/products/performance-mk-ii-carbon-mast", note: "variant 725mm" },
  "arm-pmk2-795": { usd: 1699.99, sourceUrl: "https://armstrongfoils.com/products/performance-mk-ii-carbon-mast", note: "variant 795mm" },
  "arm-pmk2-865": { usd: 1749.99, sourceUrl: "https://armstrongfoils.com/products/performance-mk-ii-carbon-mast", note: "variant 865mm" },
  "arm-pmk2-935": { usd: 1799.99, sourceUrl: "https://armstrongfoils.com/products/performance-mk-ii-carbon-mast", note: "variant 935mm" },
  "arm-px-725": { usd: 2349.99, sourceUrl: "https://armstrongfoils.com/products/performance-x-carbon-mast", note: "variant 725mm" },
  "arm-px-795": { usd: 2399.99, sourceUrl: "https://armstrongfoils.com/products/performance-x-carbon-mast", note: "variant 795mm" },
  "arm-px-865": { usd: 2449.99, sourceUrl: "https://armstrongfoils.com/products/performance-x-carbon-mast", note: "variant 865mm" },
  "arm-px-935": { usd: 2499.99, sourceUrl: "https://armstrongfoils.com/products/performance-x-carbon-mast", note: "variant 935mm" },
  "arm-speed-180": { usd: 289.99, sourceUrl: "https://armstrongfoils.com/products/speed-180" },
  "arm-surf-130": { usd: 289.99, sourceUrl: "https://armstrongfoils.com/products/surf-mk-ii-stabilizer", note: "variant 130cm2" },
  "arm-surf-170": { usd: 289.99, sourceUrl: "https://armstrongfoils.com/products/surf-mk-ii-stabilizer", note: "variant 170cm2" },
  "arm-surf-200": { usd: 289.99, sourceUrl: "https://armstrongfoils.com/products/surf-mk-ii-stabilizer", note: "variant 200cm2" },
  "arm-tc-50": { usd: 499.99, sourceUrl: "https://armstrongfoils.com/products/titanium-carbon-fuselage", note: "variant 50cm" },
  "arm-tc-60": { usd: 499.99, sourceUrl: "https://armstrongfoils.com/products/titanium-carbon-fuselage", note: "variant 60cm" },
  "arm-uha-1070": { usd: 1249.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA1070" },
  "arm-uha-1270": { usd: 1299.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA1270" },
  "arm-uha-570": { usd: 999.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA570" },
  "arm-uha-670": { usd: 1049.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA670" },
  "arm-uha-770": { usd: 1099.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA770" },
  "arm-uha-870": { usd: 1149.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA870" },
  "arm-uha-970": { usd: 1199.99, sourceUrl: "https://armstrongfoils.com/products/uha-front-foil", note: "variant UHA970" },
  "axis-advplus-crazyshort": { usd: 293.0, sourceUrl: "https://axisfoils.com/products/black-crazyshort-advance-fuselage" },
  "axis-advplus-short": { usd: 355.0, sourceUrl: "https://axisfoils.com/products/black-short-advance-fuselage" },
  "axis-advplus-sillyshort": { usd: 273.0, sourceUrl: "https://axisfoils.com/products/black-sillyshort-advance-fuselage" },
  "axis-advplus-ultrashort": { usd: 313.0, sourceUrl: "https://axisfoils.com/products/black-ultrashort-advance-fuselage" },
  "axis-al19-1050": { usd: 140.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-1050mm-foil-mast" },
  "axis-al19-450": { usd: 75.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-450mm-foil-mast" },
  "axis-al19-600": { usd: 90.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-600mm-foil-mast" },
  "axis-al19-680": { usd: 100.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-680mm-foil-mast" },
  "axis-al19-750": { usd: 108.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-750mm-foil-mast" },
  "axis-al19-820": { usd: 117.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-820mm-foil-mast" },
  "axis-al19-900": { usd: 125.0, sourceUrl: "https://axisfoils.com/products/19mm-aluminium-900mm-foil-mast" },
  "axis-artv2-1099": { usd: 783.0, sourceUrl: "https://axisfoils.com/products/art-v2-1099" },
  "axis-artv2-819": { usd: 657.0, sourceUrl: "https://axisfoils.com/products/art-v2-819" },
  "axis-artv2-879": { usd: 677.0, sourceUrl: "https://axisfoils.com/products/artv2-879" },
  "axis-artv2-939": { usd: 697.0, sourceUrl: "https://axisfoils.com/products/artv2-939" },
  "axis-artv2-999": { usd: 718.0, sourceUrl: "https://axisfoils.com/products/artv2-999" },
  "axis-fatty-800": { usd: 1174.0, sourceUrl: "https://axisfoils.com/products/axis-power-carbon-fatty-mast-base-plate-80" },
  "axis-fatty-900": { usd: 1196.0, sourceUrl: "https://axisfoils.com/products/axis-power-carbon-fatty-mast-base-plate-90" },
  "axis-fd-hm-800": { usd: 2101.0, sourceUrl: "https://axisfoils.com/products/axis-high-modulus-carbon-integrated-foil-drive-mast-800", note: "Mast-only variant" },
  "axis-fd-uhm-800": { usd: 2956.0, sourceUrl: "https://axisfoils.com/products/axis-ultra-high-modulus-carbon-integrated-foil-drive-mast-800", note: "Mast-only variant" },
  "axis-fireball-1000": { usd: 997.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1000-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-1070": { usd: 1016.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1070-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-1160": { usd: 1067.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1160-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-1250": { usd: 1121.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1160-ultra-high-mod-carbon-hydrofoil-wing-copy" },
  "axis-fireball-1350": { usd: 1178.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1350-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-1500": { usd: 1296.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1500-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-1750": { usd: 1620.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-1750-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-880": { usd: 951.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-880-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-fireball-940": { usd: 974.0, sourceUrl: "https://axisfoils.com/products/axis-fireball-940-ultra-high-mod-carbon-hydrofoil-wing" },
  "axis-kaiwi-780": { usd: 2810.0, sourceUrl: "https://axisfoils.com/products/kaiwi-ultra-high-modulus-mast-780" },
  "axis-pc-750": { usd: 1054.0, sourceUrl: "https://axisfoils.com/products/power-carbon-foil-mast-base-plate-75" },
  "axis-pc-820": { usd: 1107.0, sourceUrl: "https://axisfoils.com/products/power-carbon-foil-mast-base-plate-82" },
  "axis-pc-900": { usd: 1128.0, sourceUrl: "https://axisfoils.com/products/power-carbon-foil-mast-base-plate-90" },
  "axis-pchm-1020": { usd: 1526.0, sourceUrl: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-102" },
  "axis-pchm-750": { usd: 1325.0, sourceUrl: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-75" },
  "axis-pchm-820": { usd: 1403.0, sourceUrl: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-82" },
  "axis-pchm-900": { usd: 1456.0, sourceUrl: "https://axisfoils.com/products/power-carbon-high-modulus-foil-mast-base-plate-90" },
  "axis-pro-1050": { usd: 3000.0, sourceUrl: "https://axisfoils.com/products/pro-ultra-high-modulus-carbon-1050" },
  "axis-pro-720": { usd: 2676.0, sourceUrl: "https://axisfoils.com/products/pro-ultra-high-modulus-carbon-720" },
  "axis-pro-800": { usd: 2758.0, sourceUrl: "https://axisfoils.com/products/pro-ultra-high-modulus-carbon-800" },
  "axis-pro-900": { usd: 2862.0, sourceUrl: "https://axisfoils.com/products/copy-of-pro-ultra-high-modulus-carbon-900" },
  "axis-prog-250-56": { usd: 214.0, sourceUrl: "https://axisfoils.com/products/250-progressive-carbon-rear-wing" },
  "axis-prog-275-58": { usd: 216.0, sourceUrl: "https://axisfoils.com/products/275-progressive-carbon-rear-wing" },
  "axis-prog-300-61": { usd: 218.0, sourceUrl: "https://axisfoils.com/products/300-progressive-carbon-rear-wing" },
  "axis-prog-325-62": { usd: 220.0, sourceUrl: "https://axisfoils.com/products/325-progressive-carbon-rear-wing" },
  "axis-prog-350-63": { usd: 222.0, sourceUrl: "https://axisfoils.com/products/350-progressive-carbon-rear-wing" },
  "axis-prog-375-64": { usd: 224.0, sourceUrl: "https://axisfoils.com/products/375-progressive-carbon-rear-wing" },
  "axis-prog-400-65": { usd: 226.0, sourceUrl: "https://axisfoils.com/products/400-progressive-carbon-rear-wing" },
  "axis-prog-425-66": { usd: 243.0, sourceUrl: "https://axisfoils.com/products/425-progressive-carbon-rear-wing" },
  "axis-prog-450-67": { usd: 253.0, sourceUrl: "https://axisfoils.com/products/450-progressive-carbon-rear-wing" },
  "axis-prog-475-68": { usd: 263.0, sourceUrl: "https://axisfoils.com/products/475-progressive-carbon-rear-wing" },
  "axis-skinny-250-20": { usd: 309.0, sourceUrl: "https://axisfoils.com/products/skinny-250-20-carbon-rear-hydrofoil-wing" },
  "axis-skinny-358-25": { usd: 321.0, sourceUrl: "https://axisfoils.com/products/skinny-358-30-carbon-rear-hydrofoil-wing-copy" },
  "axis-skinny-358-30": { usd: 330.0, sourceUrl: "https://axisfoils.com/products/skinny-358-30-carbon-rear-hydrofoil-wing" },
  "axis-skinny-358-35": { usd: 220.0, sourceUrl: "https://axisfoils.com/products/skinny-358-35-carbon-rear-hydrofoil-wing" },
  "axis-skinny-359-40": { usd: 222.0, sourceUrl: "https://axisfoils.com/products/skinny-359-40-carbon-rear-hydrofoil-wing" },
  "axis-skinny-360-45": { usd: 224.0, sourceUrl: "https://axisfoils.com/products/copy-of-skinny-359-40-carbon-rear-hydrofoil-wing" },
  "axis-skinny-362-50": { usd: 234.0, sourceUrl: "https://axisfoils.com/products/copy-of-skinny-360-45-carbon-rear-hydrofoil-wing" },
  "axis-skinny-365-55": { usd: 240.0, sourceUrl: "https://axisfoils.com/products/skinny-365-55-carbon-rear-hydrofoil-wing" },
  "axis-spitfire-1030": { usd: 780.0, sourceUrl: "https://axisfoils.com/products/spitfire-1030" },
  "axis-spitfire-1100": { usd: 812.0, sourceUrl: "https://axisfoils.com/products/spitfire-1100" },
  "axis-spitfire-1180": { usd: 861.0, sourceUrl: "https://axisfoils.com/products/spitfire-1180" },
  "axis-spitfire-620": { usd: 588.0, sourceUrl: "https://axisfoils.com/products/spitfire-620" },
  "axis-spitfire-670": { usd: 606.0, sourceUrl: "https://axisfoils.com/products/spitfire-670" },
  "axis-spitfire-720": { usd: 624.0, sourceUrl: "https://axisfoils.com/products/spitfire-720" },
  "axis-spitfire-780": { usd: 650.0, sourceUrl: "https://axisfoils.com/products/spitfire-780" },
  "axis-spitfire-840": { usd: 684.0, sourceUrl: "https://axisfoils.com/products/spitfire-840" },
  "axis-spitfire-900": { usd: 720.0, sourceUrl: "https://axisfoils.com/products/spitfire-900" },
  "axis-spitfire-960": { usd: 749.0, sourceUrl: "https://axisfoils.com/products/spitfire-960" },
  "axis-surfskinny-280-43": { usd: 223.0, sourceUrl: "https://axisfoils.com/products/skinny-surf-280-43-carbon-rear-hydrofoil-wing" },
  "axis-surfskinny-300-45": { usd: 223.0, sourceUrl: "https://axisfoils.com/products/skinny-surf-300-45-carbon-rear-hydrofoil-wing" },
  "axis-surfskinny-320-48": { usd: 232.0, sourceUrl: "https://axisfoils.com/products/skinny-surf-320-48-carbon-rear-hydrofoil-wing" },
  "axis-surfskinny-340-50": { usd: 258.0, sourceUrl: "https://axisfoils.com/products/surf-skinny-340-50-carbon-rear-hydrofoil-wing" },
  "axis-surge-1010": { usd: 823.0, sourceUrl: "https://axisfoils.com/products/axis-surge-1010-carbon-hydrofoil-wing" },
  "axis-surge-1080": { usd: 889.0, sourceUrl: "https://axisfoils.com/products/axis-surge-1080-carbon-hydrofoil-wing" },
  "axis-surge-1150": { usd: 978.0, sourceUrl: "https://axisfoils.com/products/axis-surge-1150-carbon-hydrofoil-wing" },
  "axis-surge-740": { usd: 606.0, sourceUrl: "https://axisfoils.com/products/axis-surge-740-carbon-hydrofoil-wing" },
  "axis-surge-780": { usd: 644.0, sourceUrl: "https://axisfoils.com/products/axis-surge-780-carbon-hydrofoil-wing" },
  "axis-surge-830": { usd: 685.0, sourceUrl: "https://axisfoils.com/products/axis-surge-830-carbon-hydrofoil-wing" },
  "axis-surge-890": { usd: 728.0, sourceUrl: "https://axisfoils.com/products/axis-surge-890-carbon-hydrofoil-wing" },
  "axis-surge-950": { usd: 774.0, sourceUrl: "https://axisfoils.com/products/axis-surge-950-carbon-hydrofoil-wing" },
};

export type CurrencyCode = "USD" | "CAD";

export function usdToCad(usd: number): number {
  return Math.round(usd * FX_USD_TO_CAD * 100) / 100;
}

export function getPartPrice(partId: string): { usd: number | null; cad: number | null } {
  const row = PART_PRICES_USD[partId];
  if (!row || !(row.usd >= 0) || !Number.isFinite(row.usd)) {
    return { usd: null, cad: null };
  }
  return { usd: row.usd, cad: usdToCad(row.usd) };
}

export function priceForCurrency(partId: string, currency: CurrencyCode): number | null {
  const p = getPartPrice(partId);
  return currency === "CAD" ? p.cad : p.usd;
}

