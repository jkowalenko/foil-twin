import type {
  FrontWing,
  Fuselage,
  Mast,
  MastFamilyId,
  Source,
  TailWing,
} from "./types";
import { codeSrc, URLS } from "./sources";

const hmCarbon = "High Modulus carbon";
const uhmCarbon = "Ultra High Modulus carbon";

function front(p: {
  id: string;
  familyId: FrontWing["familyId"];
  familyOfficial: string;
  sizeLabel: string;
  span_mm: number;
  area_cm2: number;
  aspect_ratio: number;
  construction?: string | null;
  notes?: string[];
  sources: FrontWing["sources"];
}): FrontWing {
  return {
    kind: "front",
    brand: "code",
    chord_mm: null,
    mean_chord_mm: null,
    weight_g: null,
    volume_cm3: null,
    construction: p.construction ?? null,
    notes: p.notes ?? [],
    ...p,
  };
}

function tail(p: {
  id: string;
  familyId: TailWing["familyId"];
  familyOfficial: string;
  sizeLabel: string;
  role: TailWing["role"];
  span_mm: number;
  area_cm2: number;
  aspect_ratio: number;
  notes?: string[];
  sources: TailWing["sources"];
}): TailWing {
  return {
    kind: "tail",
    brand: "code",
    chord_mm: null,
    weight_g: null,
    construction: null,
    notes: p.notes ?? [],
    ...p,
  };
}

function fuse(p: {
  id: string;
  sizeLabel: string;
  fuse_length_mm: number;
  notes?: string[];
  sources: Fuselage["sources"];
}): Fuselage {
  return {
    kind: "fuselage",
    brand: "code",
    familyOfficial: "Code Fuselage",
    mast_forward_vs_standard_mm: null,
    mast_to_front_mm: null,
    mast_to_tail_mm: null,
    tail_lever_mm: null,
    weight_g: null,
    construction: null,
    notes: p.notes ?? [],
    ...p,
  };
}

function mast(p: {
  id: string;
  familyId: MastFamilyId;
  familyOfficial: string;
  sizeLabel: string;
  length_mm: number;
  thickness_mm?: number | null;
  chord_mm?: number | null;
  construction: string | null;
  motorIntegrated?: boolean;
  notes?: string[];
  sources: Source[];
}): Mast {
  return {
    kind: "mast",
    brand: "code",
    thickness_mm: p.thickness_mm ?? null,
    chord_mm: p.chord_mm ?? null,
    rake_deg: null,
    weight_g: null,
    motorIntegrated: p.motorIntegrated ?? false,
    notes: p.notes ?? [],
    ...p,
  };
}

const sSrc = [
  codeSrc(
    URLS.codeS,
    "official-spec-table",
    "Official S Series page. Span / area / AR 9.5 for 500S–1725S. Chord, weight, and volume are not published. Copy names 1130S–1725S as High Modulus.",
  ),
];
const rSrc = [
  codeSrc(
    URLS.codeR,
    "official-spec-table",
    "Official R Series page. Span / area / AR 13.0 for 600R–1250R. High Modulus carbon. Chord, weight, and volume are not published.",
  ),
];
const xSrc = [
  codeSrc(
    URLS.codeX,
    "official-spec-table",
    "Official X Series page. Span / area / AR 8.2 for 700X–1195X. High Modulus Carbon. Chord, weight, and volume are not published.",
  ),
];
const kangaSrc = [
  codeSrc(
    URLS.codeKanga,
    "official-spec-table",
    "Official Kanga Series page. Span / area / AR per size. Dedicated pump / dock-start / paddle-up range. Chord, weight, volume, and carbon grade are not published.",
  ),
];
const arTailSrc = [
  codeSrc(
    URLS.codeArTail,
    "official-spec-table",
    "Official AR Series tail page. Span / area / AR 8.64 for 142AR–188AR. Weight and chord are not published.",
  ),
];
const rTailSrc = [
  codeSrc(
    URLS.codeRTail,
    "official-spec-table",
    "Official R Series tail page. Span / area / AR 10.8 for 110R–151R. Weight and chord are not published.",
  ),
];
const raceTailSrc = [
  codeSrc(
    URLS.codeRaceTail,
    "official-spec-table",
    "Official Race Tails page. Race 100: 399 mm / 100 cm² / AR 16.3; Race 119: 400 mm / 119 cm² / AR 14.8. Weight and chord are not published.",
  ),
];
const fuseSrc = [
  codeSrc(
    URLS.codeFuse,
    "official-page",
    "Official fuselage page. Five lengths, 30 mm steps. Published figure is “Length from front of mast”: 2XS 420 / X-Small 450 / Small 480 / Medium 510 / Large 540 mm. Weight, mast-to-front, and tail-lever mm are not published.",
  ),
];

const hmMastSrc = [
  codeSrc(
    URLS.codeHmMast,
    "official-page",
    "Official Original Mast page. High modulus carbon. Lengths 75 / 80 / 85 cm. Thickness, chord, and weight are not published.",
  ),
];
const plusMastSrc = [
  codeSrc(
    URLS.codeUhmPlusMast,
    "official-page",
    "Official Plus Mast page. Ultra high modulus carbon; same mold as Original. Lengths 75 / 80 / 85 / 95 cm. Copy: +41% torsional / +59% flexural stiffness vs original HM on the 80 cm (tested). Thickness, chord, and weight are not published.",
  ),
];
const blackMastSrc = [
  codeSrc(
    URLS.codeBlackMast,
    "official-spec-table",
    "Official Black Series Mast page. Aerospace-grade UHM carbon. Lengths 75 / 80 / 85 cm. Thickness at narrowest point 13.6 / 14.0 / 14.2 mm. Chord 105 mm at the narrowest point (family figure). Weight is not published.",
  ),
];
const alloyMastSrc = [
  codeSrc(
    URLS.codeAlloyMast,
    "official-page",
    "Official Aluminium Mast page. Parallel extruded aluminium. Lengths 75 / 80 cm. Thickness 18.7 mm, chord 120 mm. Stem / base plate / socket sold separately. Weight is not published.",
  ),
];
const fdMastSrc = [
  codeSrc(
    URLS.codeFdMast,
    "official-product",
    "Official Code Foils x Foil Drive Integrated Carbon Mast. Ultra High Modulus carbon. Both SKUs 78 cm from top of base plate to bottom of Tuttle. Pod heights 11 cm (lighter / surf) and 17 cm (everyday). Motor-integrated. Weight is not published.",
  ),
];

const sNote =
  "Official: all-round series for prone, wing, SUP, downwind. AR 9.5 across the line. Chord / weight / volume not published.";

export const codeFronts: FrontWing[] = [
  // S Series — official order (small → large)
  front({
    id: "code-s-500",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "500S",
    span_mm: 695,
    area_cm2: 500,
    aspect_ratio: 9.5,
    notes: [sNote, "Official: highly maneuverable performance foil."],
    sources: sSrc,
  }),
  front({
    id: "code-s-615",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "615S",
    span_mm: 765,
    area_cm2: 615,
    aspect_ratio: 9.5,
    notes: [sNote, "Official: high performance, remarkably fast and loose. Suitable for tow conditions."],
    sources: sSrc,
  }),
  front({
    id: "code-s-720",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "720S",
    span_mm: 830,
    area_cm2: 720,
    aspect_ratio: 9.5,
    notes: [sNote, "Official: loose and surfy."],
    sources: sSrc,
  }),
  front({
    id: "code-s-850",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "850S",
    span_mm: 900,
    area_cm2: 850,
    aspect_ratio: 9.5,
    notes: [sNote, "Official: all round."],
    sources: sSrc,
  }),
  front({
    id: "code-s-980",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "980S",
    span_mm: 965,
    area_cm2: 980,
    aspect_ratio: 9.5,
    notes: [sNote, "Official: larger, all round front wing."],
    sources: sSrc,
  }),
  front({
    id: "code-s-1130",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "1130S",
    span_mm: 1035,
    area_cm2: 1130,
    aspect_ratio: 9.5,
    construction: hmCarbon,
    notes: [
      sNote,
      "Official: High Modulus; go-to for heavier riders in all disciplines.",
    ],
    sources: sSrc,
  }),
  front({
    id: "code-s-1300",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "1300S",
    span_mm: 1115,
    area_cm2: 1300,
    aspect_ratio: 9.5,
    construction: hmCarbon,
    notes: [sNote, "Official: High Modulus; versatile beginner wing."],
    sources: sSrc,
  }),
  front({
    id: "code-s-1540",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "1540S",
    span_mm: 1210,
    area_cm2: 1540,
    aspect_ratio: 9.5,
    construction: hmCarbon,
    notes: [sNote, "Official: High Modulus; dock start and multi-discipline beginner wing."],
    sources: sSrc,
  }),
  front({
    id: "code-s-1725",
    familyId: "code-s",
    familyOfficial: "S Series",
    sizeLabel: "1725S",
    span_mm: 1280,
    area_cm2: 1725,
    aspect_ratio: 9.5,
    construction: hmCarbon,
    notes: [sNote, "Official: High Modulus; beginner downwind, paddle up and wave."],
    sources: sSrc,
  }),

  // R Series
  front({
    id: "code-r-600",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "600R",
    span_mm: 880,
    area_cm2: 600,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: high-modulus downwind / race. Not designed to be jumped (voids warranty).",
      "Official: 600R is the smallest R; engineered for racing and big-ocean downwind.",
    ],
    sources: rSrc,
  }),
  front({
    id: "code-r-680",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "680R",
    span_mm: 935,
    area_cm2: 680,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: high-modulus downwind. Not designed to be jumped.",
      "Official: dynamic little brother of the 770R and 860R.",
    ],
    sources: rSrc,
  }),
  front({
    id: "code-r-770",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "770R",
    span_mm: 1000,
    area_cm2: 770,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: high-modulus downwind. James Casey won Paddle Imua on the 770R HM.",
      "Not designed to be jumped.",
    ],
    sources: rSrc,
  }),
  front({
    id: "code-r-860",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "860R",
    span_mm: 1050,
    area_cm2: 860,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: high-modulus downwind. 860R HM won the 2023 Molokai 2 Oahu.",
      "Not designed to be jumped.",
    ],
    sources: rSrc,
  }),
  front({
    id: "code-r-960",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "960R",
    span_mm: 1115,
    area_cm2: 960,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: larger R for lighter wind and a gateway into downwind. Not designed to be jumped.",
    ],
    sources: rSrc,
  }),
  front({
    id: "code-r-1075",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "1075R",
    span_mm: 1180,
    area_cm2: 1075,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: larger R for lighter wind and learners linking bumps. Not designed to be jumped.",
    ],
    sources: rSrc,
  }),
  front({
    id: "code-r-1250",
    familyId: "code-r",
    familyOfficial: "R Series",
    sizeLabel: "1250R",
    span_mm: 1275,
    area_cm2: 1250,
    aspect_ratio: 13,
    construction: hmCarbon,
    notes: [
      "Official: largest R; maximum glide, efficiency, and light-wind versatility. Not designed to be jumped.",
    ],
    sources: rSrc,
  }),

  // X Series
  front({
    id: "code-x-700",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "700X",
    span_mm: 755,
    area_cm2: 700,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: [
      "Official: surf-like flow; increased anhedral; High Modulus Carbon. Chord / weight / volume not published.",
      "Official: tow / wave / wind — fast, powerful and forgiving.",
    ],
    sources: xSrc,
  }),
  front({
    id: "code-x-740",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "740X",
    span_mm: 780,
    area_cm2: 740,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: ["Official: wind / wave / downwind — the precision performer."],
    sources: xSrc,
  }),
  front({
    id: "code-x-810",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "810X",
    span_mm: 814,
    area_cm2: 810,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: ["Official: wind / wave / downwind — surf, carve, control."],
    sources: xSrc,
  }),
  front({
    id: "code-x-890",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "890X",
    span_mm: 852,
    area_cm2: 890,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: ["Official: wind / wave / downwind — power, drive and flow."],
    sources: xSrc,
  }),
  front({
    id: "code-x-985",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "985X",
    span_mm: 896,
    area_cm2: 985,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: ["Official: wind / wave / downwind — surf meets versatility."],
    sources: xSrc,
  }),
  front({
    id: "code-x-1085",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "1085X",
    span_mm: 940,
    area_cm2: 1085,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: ["Official: High Modulus Carbon X Series. Chord / weight / volume not published."],
    sources: xSrc,
  }),
  front({
    id: "code-x-1195",
    familyId: "code-x",
    familyOfficial: "X Series",
    sizeLabel: "1195X",
    span_mm: 987,
    area_cm2: 1195,
    aspect_ratio: 8.2,
    construction: hmCarbon,
    notes: ["Official: High Modulus Carbon X Series. Chord / weight / volume not published."],
    sources: xSrc,
  }),

  // Kanga
  front({
    id: "code-kanga-1390",
    familyId: "code-kanga",
    familyOfficial: "Kanga",
    sizeLabel: "1390",
    span_mm: 1300,
    area_cm2: 1390,
    aspect_ratio: 12.1,
    notes: [
      "Official: dedicated pump foil (dock starts, flat-water pumping, paddle-ups, ultra-light wind).",
      "Official: for riders who have developed pumping technique and want to extend distance.",
    ],
    sources: kangaSrc,
  }),
  front({
    id: "code-kanga-1600",
    familyId: "code-kanga",
    familyOfficial: "Kanga",
    sizeLabel: "1600",
    span_mm: 1300,
    area_cm2: 1600,
    aspect_ratio: 10.6,
    notes: [
      "Official: dedicated pump foil. Ideal for progressing riders looking to build consistency.",
    ],
    sources: kangaSrc,
  }),
  front({
    id: "code-kanga-1870",
    familyId: "code-kanga",
    familyOfficial: "Kanga",
    sizeLabel: "1870",
    span_mm: 1300,
    area_cm2: 1870,
    aspect_ratio: 9.1,
    notes: ["Official: dedicated pump foil. The most beginner-friendly foil in the range."],
    sources: kangaSrc,
  }),
  front({
    id: "code-kanga-2220",
    familyId: "code-kanga",
    familyOfficial: "Kanga",
    sizeLabel: "2220",
    span_mm: 1700,
    area_cm2: 2220,
    aspect_ratio: 13,
    notes: [
      "Official: dedicated pump foil. For pump-foil enthusiasts pushing distance and duration.",
    ],
    sources: kangaSrc,
  }),
];

export const codeTails: TailWing[] = [
  tail({
    id: "code-ar-142",
    familyId: "code-ar",
    familyOfficial: "AR Series",
    sizeLabel: "142AR",
    role: "surf",
    span_mm: 340,
    area_cm2: 142,
    aspect_ratio: 8.64,
    notes: ["Official: loose and surfy, great for turning for the advanced rider."],
    sources: arTailSrc,
  }),
  tail({
    id: "code-ar-150",
    familyId: "code-ar",
    familyOfficial: "AR Series",
    sizeLabel: "150AR",
    role: "surf",
    span_mm: 360,
    area_cm2: 150,
    aspect_ratio: 8.64,
    notes: ["Official: all round performance, fast and loose."],
    sources: arTailSrc,
  }),
  tail({
    id: "code-ar-158",
    familyId: "code-ar",
    familyOfficial: "AR Series",
    sizeLabel: "158AR",
    role: "surf",
    span_mm: 380,
    area_cm2: 158,
    aspect_ratio: 8.64,
    notes: ["Official: all round performance with more stability, great for the intermediate."],
    sources: arTailSrc,
  }),
  tail({
    id: "code-ar-166",
    familyId: "code-ar",
    familyOfficial: "AR Series",
    sizeLabel: "166AR",
    role: "surf",
    span_mm: 400,
    area_cm2: 166,
    aspect_ratio: 8.64,
    notes: [
      "Official: intermediate foilers stepping down in tail size, or advanced riders wanting more hold in lighter conditions.",
    ],
    sources: arTailSrc,
  }),
  tail({
    id: "code-ar-175",
    familyId: "code-ar",
    familyOfficial: "AR Series",
    sizeLabel: "175AR",
    role: "surf",
    span_mm: 420,
    area_cm2: 175,
    aspect_ratio: 8.64,
    notes: ["Official: more stability and bottom end for learners / bigger riders."],
    sources: arTailSrc,
  }),
  tail({
    id: "code-ar-188",
    familyId: "code-ar",
    familyOfficial: "AR Series",
    sizeLabel: "188AR",
    role: "surf",
    span_mm: 450,
    area_cm2: 188,
    aspect_ratio: 8.64,
    notes: ["Official: ideal for the bigger rider or beginner."],
    sources: arTailSrc,
  }),

  tail({
    id: "code-rtail-110",
    familyId: "code-r-tail",
    familyOfficial: "R Series Tail",
    sizeLabel: "110R",
    role: "speed",
    span_mm: 340,
    area_cm2: 110,
    aspect_ratio: 10.8,
    notes: ["Official: high-aspect glide tail. Pair with S and R series fronts."],
    sources: rTailSrc,
  }),
  tail({
    id: "code-rtail-120",
    familyId: "code-r-tail",
    familyOfficial: "R Series Tail",
    sizeLabel: "120R",
    role: "speed",
    span_mm: 360,
    area_cm2: 120,
    aspect_ratio: 10.8,
    notes: ["Official: James used the 120R in M2O 2023. High-aspect glide tail."],
    sources: rTailSrc,
  }),
  tail({
    id: "code-rtail-135",
    familyId: "code-r-tail",
    familyOfficial: "R Series Tail",
    sizeLabel: "135R",
    role: "speed",
    span_mm: 380,
    area_cm2: 135,
    aspect_ratio: 10.8,
    notes: ["Official: high-aspect glide tail. AR 10.8 across the R tail line."],
    sources: rTailSrc,
  }),
  tail({
    id: "code-rtail-151",
    familyId: "code-r-tail",
    familyOfficial: "R Series Tail",
    sizeLabel: "151R",
    role: "speed",
    span_mm: 400,
    area_cm2: 151,
    aspect_ratio: 10.8,
    notes: ["Official: high-aspect glide tail. AR 10.8 across the R tail line."],
    sources: rTailSrc,
  }),

  tail({
    id: "code-race-100",
    familyId: "code-race",
    familyOfficial: "Race Tail",
    sizeLabel: "Race 100",
    role: "speed",
    span_mm: 399,
    area_cm2: 100,
    aspect_ratio: 16.3,
    notes: ["Official Race Tails page: 399 mm span, 100 cm², AR 16.3."],
    sources: raceTailSrc,
  }),
  tail({
    id: "code-race-119",
    familyId: "code-race",
    familyOfficial: "Race Tail",
    sizeLabel: "Race 119",
    role: "speed",
    span_mm: 400,
    area_cm2: 119,
    aspect_ratio: 14.8,
    notes: ["Official Race Tails page: 400 mm span, 119 cm², AR 14.8."],
    sources: raceTailSrc,
  }),
];

export const codeFuses: Fuselage[] = [
  fuse({
    id: "code-fuse-2xs",
    sizeLabel: "2XS",
    fuse_length_mm: 420,
    notes: [
      "Official: length from front of mast 420 mm. Five lengths, 30 mm steps. Smaller sizes allow a higher cadence pump and more maneuverability.",
    ],
    sources: fuseSrc,
  }),
  fuse({
    id: "code-fuse-xs",
    sizeLabel: "X-Small",
    fuse_length_mm: 450,
    notes: [
      "Official: length from front of mast 450 mm. Copy: uniquely designed for tighter turns; pair with larger foils, or with a current wing setup to loosen it.",
    ],
    sources: fuseSrc,
  }),
  fuse({
    id: "code-fuse-s",
    sizeLabel: "Small",
    fuse_length_mm: 480,
    notes: ["Official: length from front of mast 480 mm."],
    sources: fuseSrc,
  }),
  fuse({
    id: "code-fuse-m",
    sizeLabel: "Medium",
    fuse_length_mm: 510,
    notes: ["Official: length from front of mast 510 mm."],
    sources: fuseSrc,
  }),
  fuse({
    id: "code-fuse-l",
    sizeLabel: "Large",
    fuse_length_mm: 540,
    notes: [
      "Official: length from front of mast 540 mm. Large fuse: greater pitch stability; many downwind foilers prefer it for additional stability and a slower cadence pump.",
    ],
    sources: fuseSrc,
  }),
];

const hmMastNote = [
  "Official Original Mast: high modulus carbon; extended blend to base plate; tapered toward the bottom.",
  "Thickness, chord, and weight are not published.",
];
const plusMastNote = [
  "Official Plus Mast: ultra-high modulus carbon; same profile/mold as Original.",
  "Official (80 cm test): 41% more torsional stiffness and 59% more flexural stiffness vs original HM.",
  "Thickness, chord, and weight are not published.",
];

export const codeMasts: Mast[] = [
  mast({
    id: "code-hm-750",
    familyId: "code-hm",
    familyOfficial: "High Modulus Mast",
    sizeLabel: "75 cm",
    length_mm: 750,
    construction: hmCarbon,
    notes: hmMastNote,
    sources: hmMastSrc,
  }),
  mast({
    id: "code-hm-800",
    familyId: "code-hm",
    familyOfficial: "High Modulus Mast",
    sizeLabel: "80 cm",
    length_mm: 800,
    construction: hmCarbon,
    notes: hmMastNote,
    sources: hmMastSrc,
  }),
  mast({
    id: "code-hm-850",
    familyId: "code-hm",
    familyOfficial: "High Modulus Mast",
    sizeLabel: "85 cm",
    length_mm: 850,
    construction: hmCarbon,
    notes: hmMastNote,
    sources: hmMastSrc,
  }),

  mast({
    id: "code-uhm-plus-750",
    familyId: "code-uhm-plus",
    familyOfficial: "Plus Mast",
    sizeLabel: "75 cm",
    length_mm: 750,
    construction: uhmCarbon,
    notes: [...plusMastNote, "Official usage: shallow areas, prone, downwind and dock foiling."],
    sources: plusMastSrc,
  }),
  mast({
    id: "code-uhm-plus-800",
    familyId: "code-uhm-plus",
    familyOfficial: "Plus Mast",
    sizeLabel: "80 cm",
    length_mm: 800,
    construction: uhmCarbon,
    notes: [...plusMastNote, "Official: one-mast quiver option between disciplines."],
    sources: plusMastSrc,
  }),
  mast({
    id: "code-uhm-plus-850",
    familyId: "code-uhm-plus",
    familyOfficial: "Plus Mast",
    sizeLabel: "85 cm",
    length_mm: 850,
    construction: uhmCarbon,
    notes: [...plusMastNote, "Official usage: wing foil, bigger surf and tow."],
    sources: plusMastSrc,
  }),
  mast({
    id: "code-uhm-plus-950",
    familyId: "code-uhm-plus",
    familyOfficial: "Plus Mast",
    sizeLabel: "95 cm",
    length_mm: 950,
    construction: uhmCarbon,
    notes: [...plusMastNote, "Official: bigger, faster and more powerful conditions."],
    sources: plusMastSrc,
  }),

  mast({
    id: "code-black-750",
    familyId: "code-black",
    familyOfficial: "Black Series",
    sizeLabel: "75 cm",
    length_mm: 750,
    thickness_mm: 13.6,
    chord_mm: 105,
    construction: "Aerospace-grade UHM carbon",
    notes: [
      "Official: thickness 13.6 mm at the narrowest point; 8% stiffer and 9% torsionally stiffer than the 75 Plus.",
      "Family chord 105 mm at the narrowest point. Weight is not published.",
    ],
    sources: blackMastSrc,
  }),
  mast({
    id: "code-black-800",
    familyId: "code-black",
    familyOfficial: "Black Series",
    sizeLabel: "80 cm",
    length_mm: 800,
    thickness_mm: 14.0,
    chord_mm: 105,
    construction: "Aerospace-grade UHM carbon",
    notes: [
      "Official: thickness 14.0 mm at the narrowest point; 19% stiffer and 5% torsionally stiffer than the 80 Plus.",
      "Family chord 105 mm at the narrowest point. Weight is not published.",
    ],
    sources: blackMastSrc,
  }),
  mast({
    id: "code-black-850",
    familyId: "code-black",
    familyOfficial: "Black Series",
    sizeLabel: "85 cm",
    length_mm: 850,
    thickness_mm: 14.2,
    chord_mm: 105,
    construction: "Aerospace-grade UHM carbon",
    notes: [
      "Official: thickness 14.2 mm at the narrowest point; 27% stiffer and 5% torsionally stiffer than the 85 Plus.",
      "Family chord 105 mm at the narrowest point. Weight is not published.",
    ],
    sources: blackMastSrc,
  }),

  mast({
    id: "code-alloy-750",
    familyId: "code-alloy",
    familyOfficial: "Aluminium Mast",
    sizeLabel: "75 cm",
    length_mm: 750,
    thickness_mm: 18.7,
    chord_mm: 120,
    construction: "Parallel extruded aluminium",
    notes: [
      "Official: 120 mm chord, 18.7 mm thickness. Stem, base plate, top socket, and hardware sold separately.",
      "Official usage: shallow water, prone surf, downwind, and learning.",
      "Weight is not published.",
    ],
    sources: alloyMastSrc,
  }),
  mast({
    id: "code-alloy-800",
    familyId: "code-alloy",
    familyOfficial: "Aluminium Mast",
    sizeLabel: "80 cm",
    length_mm: 800,
    thickness_mm: 18.7,
    chord_mm: 120,
    construction: "Parallel extruded aluminium",
    notes: [
      "Official: 120 mm chord, 18.7 mm thickness. The all-rounder length.",
      "Weight is not published.",
    ],
    sources: alloyMastSrc,
  }),

  mast({
    id: "code-fd-780-11",
    familyId: "code-fd",
    familyOfficial: "Foil Drive Integrated",
    sizeLabel: "78 cm · 11 cm pod",
    length_mm: 780,
    construction: "Ultra High Modulus carbon, Foil Drive integrated",
    motorIntegrated: true,
    notes: [
      "Official: 78 cm from top of base plate to bottom of Tuttle. 11 cm pod for lighter riders and surf-focused use.",
      "Motor-integrated. Not a 1:1 twin of a plain mast even at similar length.",
      "Weight is not published.",
    ],
    sources: fdMastSrc,
  }),
  mast({
    id: "code-fd-780-17",
    familyId: "code-fd",
    familyOfficial: "Foil Drive Integrated",
    sizeLabel: "78 cm · 17 cm pod",
    length_mm: 780,
    construction: "Ultra High Modulus carbon, Foil Drive integrated",
    motorIntegrated: true,
    notes: [
      "Official: 78 cm from top of base plate to bottom of Tuttle. 17 cm pod for everyday riders and broader weight ranges.",
      "Motor-integrated. Not a 1:1 twin of a plain mast even at similar length.",
      "Weight is not published.",
    ],
    sources: fdMastSrc,
  }),
];
