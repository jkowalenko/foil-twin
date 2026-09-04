import type { Mast, MastFamilyId, Source } from "./types";
import { mastSrc, URLS } from "./sources";

function mast(p: {
  id: string;
  brand: Mast["brand"];
  familyId: MastFamilyId;
  familyOfficial: string;
  sizeLabel: string;
  length_mm: number | null;
  thickness_mm?: number | null;
  chord_mm?: number | null;
  rake_deg?: number | null;
  weight_g?: number | null;
  construction: string | null;
  motorIntegrated?: boolean;
  notes?: string[];
  sources: Source[];
}): Mast {
  return {
    ...p,
    kind: "mast",
    thickness_mm: p.thickness_mm ?? null,
    chord_mm: p.chord_mm ?? null,
    rake_deg: p.rake_deg ?? null,
    weight_g: p.weight_g ?? null,
    motorIntegrated: p.motorIntegrated ?? false,
    notes: p.notes ?? [],
  };
}

const axisAlSrc = [
  mastSrc(
    URLS.axisAluminiumMasts,
    "official-page",
    "Official 19mm aluminium collection. Lengths listed as live products: 105 / 90 / 82 / 75 / 68 / 60 / 45 cm. Copy: 19mm section is 2.24× stiffer than typical 15mm masts; 16mm option is mentioned in body copy and on the hosted size chart, but individual 16mm product pages returned 404 on retrieval so 16mm SKUs are not cataloged. Weight is not published. Size chart image lists the same 19mm lengths (1050–450 mm).",
  ),
  mastSrc(URLS.axisMasts, "official-page", "Current AXIS masts index includes the 19mm aluminium lengths."),
];

const axisPcSrc = [
  mastSrc(
    URLS.axisCarbonMasts,
    "official-page",
    "Current carbon mast collection lists Power Carbon 750 / 820 / 900 mm. Family copy: one-piece carbon; Power Carbon is 25% stiffer than AXIS 19mm alloy (stated on the PRO collection). Weight is not published.",
  ),
  mastSrc(
    URLS.axisPc900,
    "official-product",
    "Power Carbon 900 mm product page. Construction is carbon (the High Modulus variant is a separate family).",
  ),
];

const axisPcHmSrc = [
  mastSrc(
    URLS.axisCarbonMasts,
    "official-page",
    "Power Carbon High Modulus listed at 750 / 820 / 900 / 1020 mm. Official copy: High Modulus carbon; 35% more bend resistance than the 19mm aluminium mast. Weight is not published.",
  ),
  mastSrc(URLS.axisPcHm900, "official-product", "Power Carbon High Modulus 900 mm product page."),
];

const axisFattySrc = [
  mastSrc(
    URLS.axisFatty800,
    "official-product",
    "Fatty 800 mm. Official: 18.5 mm section, longer chord, deeper fuse connection, Medium Modulus Carbon. Lengths 800 mm and 900 mm. Aimed at large-span foils and riders over 95 kg. Weight is not published.",
  ),
  mastSrc(URLS.axisFatty900, "official-product", "Fatty 900 mm product page. Same family copy as the 800."),
  mastSrc(URLS.axisCarbonMasts, "official-page", "Fatty 80 and 90 listed on the current carbon mast collection."),
];

const axisProSrc = [
  mastSrc(
    URLS.axisProUhmMasts,
    "official-page",
    "PRO Ultra High Modulus Carbon. Official: 55% stiffer than 19mm alloy; 13.5 mm thickness in the bottom section; 12.5 mm less chord in the bottom half vs Power Carbon; ultra-high modulus materials. Collection lists 720 / 800 / 900 / 1050 mm (older body copy still says three sizes; the 720 is a live product). Weight is not published.",
  ),
  mastSrc(URLS.axisPro720, "official-product", "PRO UHM 720 mm product page."),
  mastSrc(URLS.axisPro800, "official-product", "PRO UHM 800 mm product page."),
  mastSrc(URLS.axisPro900, "official-product", "PRO UHM 900 mm product page (official slug still contains copy-of-)."),
  mastSrc(URLS.axisPro1050, "official-product", "PRO UHM 1050 mm product page."),
];

const axisKaiwiSrc = [
  mastSrc(
    URLS.axisKaiwi780,
    "official-product",
    "KAIWI Ultra High Modulus Uni Carbon Mast 780. Official: 780 mm; designed for wings up to 100 cm span (excluding Tempo) and riders 85 kg or less; downwind / pump / prone efficiency. Thickness, chord, and weight are not published as numbers.",
  ),
  mastSrc(URLS.axisCarbonMasts, "official-page", "Kaiwi 780 listed on the current carbon mast collection."),
];

const axisFdSrc = [
  mastSrc(
    URLS.axisFdHm800,
    "official-product",
    "High Modulus Carbon Integrated Foil Drive Mast 800. Official: 800 mm; motor pod 15 cm below the baseplate; cables inside. Weight is not published.",
  ),
  mastSrc(
    URLS.axisFdUhm800,
    "official-product",
    "Ultra High Modulus Carbon Integrated Foil Drive Mast 800. Same 800 mm integrated platform in the UHM variant. Weight is not published.",
  ),
  mastSrc(URLS.axisCarbonMasts, "official-page", "Both integrated Foil Drive 800 masts listed on the carbon collection."),
];

const armAlloySrc = [
  mastSrc(
    URLS.armstrongAlloyMast,
    "official-product",
    "Official Alloy Mast product. Sizes on the page: 58 cm / 72 cm / 85 cm. Construction: 6061 aluminium alloy. Exclusively compatible with the Armstrong Alloy fuselage (not A+). Hardware, top plate, and bottom bracket sold separately. Weight, thickness, and chord are not published.",
  ),
  mastSrc(URLS.armstrongMasts, "official-page", "Alloy Mast is one of six current products on the Armstrong masts collection."),
];

const armMk2Src = [
  mastSrc(
    URLS.armstrongMk2Carbon,
    "official-spec-table",
    "Official Mk II Carbon Mast spec blocks: 655 / 725 / 795 / 865 mm. Thickness 15.8 mm, chord 116 mm, weights 1530 / 1780 / 1895 / 2150 g. Copy: 0° rake across all sizes; entry carbon; A+ System.",
  ),
  mastSrc(URLS.armstrongCarbonGuide, "official-page", "Carbon mast range guide: Carbon Mk II is the 15.8 mm accessible carbon mast."),
];

const armPerfMk2Src = [
  mastSrc(
    URLS.armstrongPerfMk2,
    "official-spec-table",
    "Official Performance Mk II spec blocks: 725 / 795 / 865 / 935 mm. Thickness 13.8 mm, chord 114 mm, weights 1740 / 1940 / 2070 / 2175 g. 725 mm page prints mast angle 0.5°. Carbon range FAQ: 725/795 set at 0.5°, 865/935 set at 1.0°. Construction: premium high modulus carbon. Official URL spelling is peformance-mk-ii-carbon-mast.",
  ),
  mastSrc(URLS.armstrongCarbonGuide, "official-page", "Guide: Performance Mk II is the 13.8 mm all-rounder; 30% more bending / 20% more torsional stiffness vs Mk I."),
];

const armPerfXSrc = [
  mastSrc(
    URLS.armstrongPerfX,
    "official-spec-table",
    "Official Performance-X spec blocks: 725 mm 12.2 mm / 105.8 mm / 1650 g; 795 mm 12.25 / 106.8 / 1915 g; 865 mm 12.45 / 107.8 / 2045 g; 935 mm 12.75 / 108.8 / 2100 g. Ultra-high modulus carbon. Same 0.5° / 1.0° rake split as Performance Mk II (725/795 vs 865/935) per the official carbon mast FAQ.",
  ),
  mastSrc(URLS.armstrongCarbonGuide, "official-page", "Guide: Performance-X is the efficiency mast (~12 mm profile)."),
];

const armFdAssistSrc = [
  mastSrc(
    URLS.armstrongFdAssist,
    "official-product",
    "Foil Drive Foil Assist Integrated Carbon Mast. Official: length 795 mm, pod height 185 mm. Same layup DNA as Performance Carbon. Motor/battery not included. Weight is not published.",
  ),
];

const armFdEfoilSrc = [
  mastSrc(
    URLS.armstrongFdEfoil,
    "official-product",
    "Foil Drive E-Foil Integrated Carbon Mast. Official: length 795 mm, pod height 650 mm. Purpose-built for consistent motor submersion. Weight is not published.",
  ),
];

const axisAlNotes = [
  "19mm aluminium. Requires AXIS base plate and 19mm Doodad to the fuselage. Compatible with Black and Red fuselages.",
  "Weight is not published on axisfoils.com.",
];

export const masts: Mast[] = [
  mast({
    id: "axis-al19-1050",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "105 cm",
    length_mm: 1050,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: big swell downwinders, aggressive riding, speed kite foiling."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_1050, "official-product")],
  }),
  mast({
    id: "axis-al19-900",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "90 cm",
    length_mm: 900,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: big wave / tow-in, open-ocean downwind, standard wing / wind / kite length."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_900, "official-product")],
  }),
  mast({
    id: "axis-al19-820",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "82 cm",
    length_mm: 820,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: bigger surf, downwinders, advanced riding."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_820, "official-product")],
  }),
  mast({
    id: "axis-al19-750",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "75 cm",
    length_mm: 750,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: wing surf or a surfier kite option."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_750, "official-product")],
  }),
  mast({
    id: "axis-al19-680",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "68 cm",
    length_mm: 680,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: prone surf, all-round SUP, shallow wing."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_680, "official-product")],
  }),
  mast({
    id: "axis-al19-600",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "60 cm",
    length_mm: 600,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: starting length for all disciplines, shallow water."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_600, "official-product")],
  }),
  mast({
    id: "axis-al19-450",
    brand: "axis",
    familyId: "axis-al-19",
    familyOfficial: "19mm Aluminium",
    sizeLabel: "45 cm",
    length_mm: 450,
    thickness_mm: 19,
    construction: "19mm aluminium extrusion; AXIS base plate + 19mm Doodad",
    notes: [...axisAlNotes, "Official usage: first flights."],
    sources: [...axisAlSrc, mastSrc(URLS.axisAl19_450, "official-product")],
  }),

  mast({
    id: "axis-pc-900",
    brand: "axis",
    familyId: "axis-pc",
    familyOfficial: "Power Carbon",
    sizeLabel: "900 mm",
    length_mm: 900,
    construction: "One-piece Power Carbon with integrated base plate",
    notes: [
      "Official: one-piece carbon; 25% stiffer than AXIS 19mm alloy (PRO collection comparison).",
      "Weight is not published.",
    ],
    sources: [...axisPcSrc, mastSrc(URLS.axisPc900, "official-product")],
  }),
  mast({
    id: "axis-pc-820",
    brand: "axis",
    familyId: "axis-pc",
    familyOfficial: "Power Carbon",
    sizeLabel: "820 mm",
    length_mm: 820,
    construction: "One-piece Power Carbon with integrated base plate",
    notes: ["Weight is not published."],
    sources: [...axisPcSrc, mastSrc(URLS.axisPc820, "official-product")],
  }),
  mast({
    id: "axis-pc-750",
    brand: "axis",
    familyId: "axis-pc",
    familyOfficial: "Power Carbon",
    sizeLabel: "750 mm",
    length_mm: 750,
    construction: "One-piece Power Carbon with integrated base plate",
    notes: ["Weight is not published."],
    sources: [...axisPcSrc, mastSrc(URLS.axisPc750, "official-product")],
  }),

  mast({
    id: "axis-pchm-1020",
    brand: "axis",
    familyId: "axis-pc-hm",
    familyOfficial: "Power Carbon High Modulus",
    sizeLabel: "1020 mm",
    length_mm: 1020,
    construction: "One-piece Power Carbon High Modulus with integrated base plate",
    notes: [
      "Official: High Modulus carbon; 35% more bend resistance than the 19mm aluminium mast.",
      "Weight is not published.",
    ],
    sources: [...axisPcHmSrc, mastSrc(URLS.axisPcHm1020, "official-product")],
  }),
  mast({
    id: "axis-pchm-900",
    brand: "axis",
    familyId: "axis-pc-hm",
    familyOfficial: "Power Carbon High Modulus",
    sizeLabel: "900 mm",
    length_mm: 900,
    construction: "One-piece Power Carbon High Modulus with integrated base plate",
    notes: ["Weight is not published."],
    sources: [...axisPcHmSrc, mastSrc(URLS.axisPcHm900, "official-product")],
  }),
  mast({
    id: "axis-pchm-820",
    brand: "axis",
    familyId: "axis-pc-hm",
    familyOfficial: "Power Carbon High Modulus",
    sizeLabel: "820 mm",
    length_mm: 820,
    construction: "One-piece Power Carbon High Modulus with integrated base plate",
    notes: ["Weight is not published."],
    sources: [...axisPcHmSrc, mastSrc(URLS.axisPcHm820, "official-product")],
  }),
  mast({
    id: "axis-pchm-750",
    brand: "axis",
    familyId: "axis-pc-hm",
    familyOfficial: "Power Carbon High Modulus",
    sizeLabel: "750 mm",
    length_mm: 750,
    construction: "One-piece Power Carbon High Modulus with integrated base plate",
    notes: ["Weight is not published."],
    sources: [...axisPcHmSrc, mastSrc(URLS.axisPcHm750, "official-product")],
  }),

  mast({
    id: "axis-fatty-900",
    brand: "axis",
    familyId: "axis-fatty",
    familyOfficial: "Power Carbon FATTY",
    sizeLabel: "900 mm",
    length_mm: 900,
    thickness_mm: 18.5,
    construction: "Medium Modulus Carbon Fatty section, 18.5 mm, longer chord, deeper fuselage connection",
    notes: [
      "Official: for large-span foils (1500+) and riders over 95 kg / 200 lb.",
      "Weight is not published.",
    ],
    sources: axisFattySrc,
  }),
  mast({
    id: "axis-fatty-800",
    brand: "axis",
    familyId: "axis-fatty",
    familyOfficial: "Power Carbon FATTY",
    sizeLabel: "800 mm",
    length_mm: 800,
    thickness_mm: 18.5,
    construction: "Medium Modulus Carbon Fatty section, 18.5 mm, longer chord, deeper fuselage connection",
    notes: ["Weight is not published."],
    sources: axisFattySrc,
  }),

  mast({
    id: "axis-pro-1050",
    brand: "axis",
    familyId: "axis-pro-uhm",
    familyOfficial: "PRO Ultra High Modulus Carbon",
    sizeLabel: "1050 mm",
    length_mm: 1050,
    thickness_mm: 13.5,
    construction: "Ultra High Modulus carbon (PRO / dogleg section); 13.5 mm bottom thickness",
    notes: [
      "Official: 55% stiffer than 19mm alloy; thinner/narrower than Power Carbon in the bottom half.",
      "13.5 mm is the published bottom-section thickness, not a constant full-length thickness.",
      "Weight is not published.",
    ],
    sources: axisProSrc,
  }),
  mast({
    id: "axis-pro-900",
    brand: "axis",
    familyId: "axis-pro-uhm",
    familyOfficial: "PRO Ultra High Modulus Carbon",
    sizeLabel: "900 mm",
    length_mm: 900,
    thickness_mm: 13.5,
    construction: "Ultra High Modulus carbon (PRO / dogleg section); 13.5 mm bottom thickness",
    notes: ["Weight is not published. 13.5 mm is the published bottom-section thickness."],
    sources: axisProSrc,
  }),
  mast({
    id: "axis-pro-800",
    brand: "axis",
    familyId: "axis-pro-uhm",
    familyOfficial: "PRO Ultra High Modulus Carbon",
    sizeLabel: "800 mm",
    length_mm: 800,
    thickness_mm: 13.5,
    construction: "Ultra High Modulus carbon (PRO / dogleg section); 13.5 mm bottom thickness",
    notes: ["Weight is not published. 13.5 mm is the published bottom-section thickness."],
    sources: axisProSrc,
  }),
  mast({
    id: "axis-pro-720",
    brand: "axis",
    familyId: "axis-pro-uhm",
    familyOfficial: "PRO Ultra High Modulus Carbon",
    sizeLabel: "720 mm",
    length_mm: 720,
    thickness_mm: 13.5,
    construction: "Ultra High Modulus carbon (PRO / dogleg section); 13.5 mm bottom thickness",
    notes: [
      "Live product on the PRO collection even though some collection body copy still says three sizes.",
      "Weight is not published.",
    ],
    sources: axisProSrc,
  }),

  mast({
    id: "axis-kaiwi-780",
    brand: "axis",
    familyId: "axis-kaiwi",
    familyOfficial: "KAIWI Ultra High Modulus Uni Carbon",
    sizeLabel: "780 mm",
    length_mm: 780,
    construction: "Ultra High Modulus uni carbon (Kaiwi low-drag section)",
    notes: [
      "Official: for wings up to 100 cm span (excluding Tempo) and riders 85 kg or less.",
      "Thickness, chord, and weight are not published as numbers.",
    ],
    sources: axisKaiwiSrc,
  }),

  mast({
    id: "axis-fd-uhm-800",
    brand: "axis",
    familyId: "axis-fd-uhm",
    familyOfficial: "UHM Carbon Integrated Foil Drive",
    sizeLabel: "800 mm",
    length_mm: 800,
    construction: "Ultra High Modulus carbon, Foil Drive motor pod 15 cm below the baseplate, internal cables",
    motorIntegrated: true,
    notes: [
      "Motor-integrated. Not a 1:1 twin of a plain mast even at similar length.",
      "Weight is not published.",
    ],
    sources: axisFdSrc,
  }),
  mast({
    id: "axis-fd-hm-800",
    brand: "axis",
    familyId: "axis-fd-hm",
    familyOfficial: "HM Carbon Integrated Foil Drive",
    sizeLabel: "800 mm",
    length_mm: 800,
    construction: "High Modulus carbon, Foil Drive motor pod 15 cm below the baseplate, internal cables",
    motorIntegrated: true,
    notes: [
      "Motor-integrated. Not a 1:1 twin of a plain mast even at similar length.",
      "Weight is not published.",
    ],
    sources: axisFdSrc,
  }),

  mast({
    id: "arm-alloy-85",
    brand: "armstrong",
    familyId: "arm-alloy",
    familyOfficial: "Alloy Mast",
    sizeLabel: "85 cm",
    length_mm: 850,
    construction: "6061 aluminium alloy (Alloy System — not A+)",
    notes: [
      "Official size 85 cm. Exclusively compatible with Armstrong Alloy fuselage.",
      "Weight, thickness, and chord are not published.",
    ],
    sources: armAlloySrc,
  }),
  mast({
    id: "arm-alloy-72",
    brand: "armstrong",
    familyId: "arm-alloy",
    familyOfficial: "Alloy Mast",
    sizeLabel: "72 cm",
    length_mm: 720,
    construction: "6061 aluminium alloy (Alloy System — not A+)",
    notes: [
      "Official size 72 cm. Exclusively compatible with Armstrong Alloy fuselage.",
      "Weight, thickness, and chord are not published.",
    ],
    sources: armAlloySrc,
  }),
  mast({
    id: "arm-alloy-58",
    brand: "armstrong",
    familyId: "arm-alloy",
    familyOfficial: "Alloy Mast",
    sizeLabel: "58 cm",
    length_mm: 580,
    construction: "6061 aluminium alloy (Alloy System — not A+)",
    notes: [
      "Official size 58 cm. Exclusively compatible with Armstrong Alloy fuselage.",
      "Weight, thickness, and chord are not published.",
    ],
    sources: armAlloySrc,
  }),

  mast({
    id: "arm-cmk2-865",
    brand: "armstrong",
    familyId: "arm-carbon-mk2",
    familyOfficial: "Mk II Carbon Mast",
    sizeLabel: "865 mm",
    length_mm: 865,
    thickness_mm: 15.8,
    chord_mm: 116,
    rake_deg: 0,
    weight_g: 2150,
    construction: "Carbon, 15.8 mm section, A+ System",
    notes: ["Official spec block. 0° rake across the Mk II Carbon family."],
    sources: armMk2Src,
  }),
  mast({
    id: "arm-cmk2-795",
    brand: "armstrong",
    familyId: "arm-carbon-mk2",
    familyOfficial: "Mk II Carbon Mast",
    sizeLabel: "795 mm",
    length_mm: 795,
    thickness_mm: 15.8,
    chord_mm: 116,
    rake_deg: 0,
    weight_g: 1895,
    construction: "Carbon, 15.8 mm section, A+ System",
    notes: ["Official spec block. 0° rake across the Mk II Carbon family."],
    sources: armMk2Src,
  }),
  mast({
    id: "arm-cmk2-725",
    brand: "armstrong",
    familyId: "arm-carbon-mk2",
    familyOfficial: "Mk II Carbon Mast",
    sizeLabel: "725 mm",
    length_mm: 725,
    thickness_mm: 15.8,
    chord_mm: 116,
    rake_deg: 0,
    weight_g: 1780,
    construction: "Carbon, 15.8 mm section, A+ System",
    notes: ["Official spec block. 0° rake across the Mk II Carbon family."],
    sources: armMk2Src,
  }),
  mast({
    id: "arm-cmk2-655",
    brand: "armstrong",
    familyId: "arm-carbon-mk2",
    familyOfficial: "Mk II Carbon Mast",
    sizeLabel: "655 mm",
    length_mm: 655,
    thickness_mm: 15.8,
    chord_mm: 116,
    rake_deg: 0,
    weight_g: 1530,
    construction: "Carbon, 15.8 mm section, A+ System",
    notes: ["Official spec block. 0° rake across the Mk II Carbon family."],
    sources: armMk2Src,
  }),

  mast({
    id: "arm-pmk2-935",
    brand: "armstrong",
    familyId: "arm-perf-mk2",
    familyOfficial: "Performance Mk II Carbon Mast",
    sizeLabel: "935 mm",
    length_mm: 935,
    thickness_mm: 13.8,
    chord_mm: 114,
    rake_deg: 1,
    weight_g: 2175,
    construction: "Premium high modulus carbon, 13.8 mm section, A+ System",
    notes: ["Official spec block. 865/935 lengths are set at 1.0° per Armstrong's carbon mast FAQ."],
    sources: armPerfMk2Src,
  }),
  mast({
    id: "arm-pmk2-865",
    brand: "armstrong",
    familyId: "arm-perf-mk2",
    familyOfficial: "Performance Mk II Carbon Mast",
    sizeLabel: "865 mm",
    length_mm: 865,
    thickness_mm: 13.8,
    chord_mm: 114,
    rake_deg: 1,
    weight_g: 2070,
    construction: "Premium high modulus carbon, 13.8 mm section, A+ System",
    notes: ["Official spec block. 865/935 lengths are set at 1.0° per Armstrong's carbon mast FAQ."],
    sources: armPerfMk2Src,
  }),
  mast({
    id: "arm-pmk2-795",
    brand: "armstrong",
    familyId: "arm-perf-mk2",
    familyOfficial: "Performance Mk II Carbon Mast",
    sizeLabel: "795 mm",
    length_mm: 795,
    thickness_mm: 13.8,
    chord_mm: 114,
    rake_deg: 0.5,
    weight_g: 1940,
    construction: "Premium high modulus carbon, 13.8 mm section, A+ System",
    notes: ["Official spec block. 725/795 lengths are set at 0.5° per Armstrong's carbon mast FAQ."],
    sources: armPerfMk2Src,
  }),
  mast({
    id: "arm-pmk2-725",
    brand: "armstrong",
    familyId: "arm-perf-mk2",
    familyOfficial: "Performance Mk II Carbon Mast",
    sizeLabel: "725 mm",
    length_mm: 725,
    thickness_mm: 13.8,
    chord_mm: 114,
    rake_deg: 0.5,
    weight_g: 1740,
    construction: "Premium high modulus carbon, 13.8 mm section, A+ System",
    notes: ["Official spec block prints mast angle 0.5° on the 725 mm size."],
    sources: armPerfMk2Src,
  }),

  mast({
    id: "arm-px-935",
    brand: "armstrong",
    familyId: "arm-perf-x",
    familyOfficial: "Performance-X Carbon Mast",
    sizeLabel: "935 mm",
    length_mm: 935,
    thickness_mm: 12.75,
    chord_mm: 108.8,
    rake_deg: 1,
    weight_g: 2100,
    construction: "Ultra-high modulus carbon, A+ System",
    notes: ["Official spec block. 865/935 set at 1.0° per Armstrong's carbon mast FAQ."],
    sources: armPerfXSrc,
  }),
  mast({
    id: "arm-px-865",
    brand: "armstrong",
    familyId: "arm-perf-x",
    familyOfficial: "Performance-X Carbon Mast",
    sizeLabel: "865 mm",
    length_mm: 865,
    thickness_mm: 12.45,
    chord_mm: 107.8,
    rake_deg: 1,
    weight_g: 2045,
    construction: "Ultra-high modulus carbon, A+ System",
    notes: ["Official spec block. 865/935 set at 1.0° per Armstrong's carbon mast FAQ."],
    sources: armPerfXSrc,
  }),
  mast({
    id: "arm-px-795",
    brand: "armstrong",
    familyId: "arm-perf-x",
    familyOfficial: "Performance-X Carbon Mast",
    sizeLabel: "795 mm",
    length_mm: 795,
    thickness_mm: 12.25,
    chord_mm: 106.8,
    rake_deg: 0.5,
    weight_g: 1915,
    construction: "Ultra-high modulus carbon, A+ System",
    notes: ["Official spec block. 725/795 set at 0.5° per Armstrong's carbon mast FAQ."],
    sources: armPerfXSrc,
  }),
  mast({
    id: "arm-px-725",
    brand: "armstrong",
    familyId: "arm-perf-x",
    familyOfficial: "Performance-X Carbon Mast",
    sizeLabel: "725 mm",
    length_mm: 725,
    thickness_mm: 12.2,
    chord_mm: 105.8,
    rake_deg: 0.5,
    weight_g: 1650,
    construction: "Ultra-high modulus carbon, A+ System",
    notes: ["Official spec block prints mast angle 0.5° on the 725 mm size."],
    sources: armPerfXSrc,
  }),

  mast({
    id: "arm-fd-assist-795",
    brand: "armstrong",
    familyId: "arm-fd-assist",
    familyOfficial: "Foil Drive Assist Integrated Carbon",
    sizeLabel: "795 mm · 185 mm pod",
    length_mm: 795,
    construction: "Carbon, Foil Drive integrated (Performance Carbon DNA), A+ System",
    motorIntegrated: true,
    notes: [
      "Official: 795 mm length, 185 mm motor pod height. Motor and battery not included.",
      "Motor-integrated. Not a 1:1 twin of a plain mast even at similar length.",
      "Weight is not published.",
    ],
    sources: armFdAssistSrc,
  }),
  mast({
    id: "arm-fd-efoil-795",
    brand: "armstrong",
    familyId: "arm-fd-efoil",
    familyOfficial: "Foil Drive E-Foil Integrated Carbon",
    sizeLabel: "795 mm · 650 mm pod",
    length_mm: 795,
    construction: "Carbon, Foil Drive e-foil integrated, A+ System",
    motorIntegrated: true,
    notes: [
      "Official: 795 mm length, 650 mm motor pod height for full-time submersion.",
      "Motor-integrated. Not a 1:1 twin of a plain mast even at similar length.",
      "Weight is not published.",
    ],
    sources: armFdEfoilSrc,
  }),
];
