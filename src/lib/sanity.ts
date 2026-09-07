import { catalog, fusesByBrand } from "../data/catalog";
import { GOALS, QUIVER_STORAGE_KEY, QUIVER_UI_STORAGE_KEY } from "../data/labels";
import type { Goal, QuiverDoc, Setup } from "../data/types";
import { frontTitle } from "./format";
import {
  MIN_FRONT_TWIN,
  MIN_MAP_FRONT,
  arClass,
  describeTwin,
  rankFrontTwins,
  nearestMast,
  rankMastTwins,
  rankTwins,
  resolveSetup,
  sameArClass,
} from "./match";
import { isStrictForward, longerFuse, nextSetups, shorterFuse, type NextSetup } from "./progression";
import type { RiderLevel } from "../data/types";
import {
  FRONT_OVERLAP_MIN,
  analyzeGaps,
  brandConvert,
  newNamedSetup,
  recommendBuys,
  upsertNamedSetup,
} from "./quiver";
import { DEFAULT_QUIVER_UI, parseQuiverUi } from "./quiverUi";
import { MAST_FAMILY_TWIN, twinMastFamily } from "./mastFamilies";
import {
  FX_USD_TO_CAD,
  PART_PRICES_USD,
  getPartPrice,
  usdToCad,
} from "../data/prices";

function quiverDoc(partial: Partial<QuiverDoc> & { parts: QuiverDoc["parts"] }): QuiverDoc {
  return {
    version: 1,
    owner: null,
    updated: new Date().toISOString(),
    setups: [],
    disciplines: ["wing"],
    level: "comfortable",
    goal: "more-speed",
    ...partial,
  };
}

function assertRiderConvertCopy(label: string, convert: ReturnType<typeof brandConvert>) {
  if (!convert) throw new Error(`${label}: expected convert`);
  const blob = [
    convert.headline,
    ...convert.coverageTiers.map((t) => t.note ?? ""),
    ...convert.rangeSummaries.map((r) => r.note),
    ...convert.coverageTiers.flatMap((t) => t.items.map((i) => i.note ?? "")),
  ].join("\n");
  if (/greedy|set-cover|heuristic|~80%|~90%|covering \d+\/\d+/i.test(blob)) {
    throw new Error(`${label}: convert copy still has matcher jargon:\n${blob}`);
  }
}

function assertCompleteKit(label: string, convert: ReturnType<typeof brandConvert>) {
  if (!convert) throw new Error(`${label}: expected convert`);
  for (const pct of [80, 90] as const) {
    const tier = convert.coverageTiers.find((t) => t.pct === pct);
    if (!tier) throw new Error(`${label}: missing ${pct}% tier`);
    const kinds = new Set(tier.items.map((i) => i.kind));
    for (const k of ["front", "tail", "fuse", "mast"] as const) {
      if (!kinds.has(k)) {
        throw new Error(
          `${label}: ${pct}% missing ${k} (items: ${
            tier.items.map((i) => `${i.kind}:${i.twinTitle}`).join(", ") || "(none)"
          })`,
        );
      }
    }
  }
  const t80 = convert.coverageTiers.find((t) => t.pct === 80)!;
  const t90 = convert.coverageTiers.find((t) => t.pct === 90)!;
  const keys90 = new Set(t90.items.map((i) => `${i.kind}:${i.twinId}`));
  for (const item of t80.items) {
    if (!keys90.has(`${item.kind}:${item.twinId}`)) {
      throw new Error(`${label}: 80% ${item.kind}:${item.twinId} (${item.twinTitle}) not in 90%`);
    }
  }
  if (t80.items.length > t90.items.length) {
    throw new Error(`${label}: 80% has more unique buys than 90%`);
  }
}

function setup(frontId: string, fuseId: string, tailId: string): Setup {
  const brand = catalog.fronts.find((f) => f.id === frontId)!.brand;
  return { brand, frontId, fuseId, tailId };
}

function section(title: string) {
  console.log(`\n## ${title}`);
}

section("Catalog counts");
const axisF = catalog.fronts.filter((f) => f.brand === "axis");
const armF = catalog.fronts.filter((f) => f.brand === "armstrong");
const axisM = catalog.masts.filter((m) => m.brand === "axis");
const armM = catalog.masts.filter((m) => m.brand === "armstrong");
console.log(
  `Fronts Axis ${axisF.length} / Armstrong ${armF.length}; tails ${catalog.tails.length}; fuses ${catalog.fuselages.length}; masts Axis ${axisM.length} / Armstrong ${armM.length}`,
);
for (const brand of ["axis", "armstrong"] as const) {
  const fams = [...new Set(catalog.fronts.filter((f) => f.brand === brand).map((f) => f.familyOfficial))];
  console.log(`  ${brand} families: ${fams.join(", ")}`);
  const mf = [...new Set(catalog.masts.filter((m) => m.brand === brand).map((m) => m.familyOfficial))];
  console.log(`  ${brand} masts: ${mf.join(", ")}`);
}
const missingSrc = catalog.masts.filter((m) => !m.sources.length);
const missingLen = catalog.masts.filter((m) => m.length_mm == null);
console.log(
  `Masts without sources: ${missingSrc.length}; masts without length: ${missingLen.length}; mast retrieved ${catalog.mastRetrieved}`,
);
const armWeighted = catalog.masts.filter((m) => m.brand === "armstrong" && m.weight_g != null);
console.log(`Armstrong masts with published weight: ${armWeighted.length}/${armM.length}`);

const cases: { name: string; s: Setup }[] = [
  {
    name: "Axis ART v2 879 + Ultra Short + Skinny 360/45",
    s: setup("axis-artv2-879", "axis-advplus-ultrashort", "axis-skinny-360-45"),
  },
  {
    name: "Axis Fireball 1070 + Short + Skinny 359/40",
    s: setup("axis-fireball-1070", "axis-advplus-short", "axis-skinny-359-40"),
  },
  {
    name: "Axis Spitfire 840 + Crazy Short + Progressive 300/61",
    s: setup("axis-spitfire-840", "axis-advplus-crazyshort", "axis-prog-300-61"),
  },
  {
    name: "Axis Surge 890 + Silly Short + Surf Skinny 320/48",
    s: setup("axis-surge-890", "axis-advplus-sillyshort", "axis-surfskinny-320-48"),
  },
  {
    name: "Armstrong HA 880 + TC60 + Speed 180",
    s: setup("arm-ha-880", "arm-tc-60", "arm-speed-180"),
  },
  {
    name: "Armstrong UHA 870 + TC60 + Dart 140",
    s: setup("arm-uha-870", "arm-tc-60", "arm-dart-140"),
  },
  {
    name: "Armstrong MA Mk II 890 + TC50 + Surf 170",
    s: setup("arm-ma-890", "arm-tc-50", "arm-surf-170"),
  },
];

for (const c of cases) {
  section(c.name);
  const twins = rankTwins(c.s, 3);
  twins.forEach((t, i) => {
    console.log(
      `  ${i + 1}. ${Math.round(t.total)}%  ${describeTwin(t)}  (front ${Math.round(t.frontScore ?? 0)} / tail ${Math.round(t.tailScore ?? 0)} / fuse ${Math.round(t.fuseScore ?? 0)})`,
    );
    console.log(`     ${t.why[0] ?? ""}`);
  });
}

section("Front-only nearest other brand");
for (const id of [
  "axis-artv2-879",
  "axis-fireball-1070",
  "axis-spitfire-840",
  "axis-surge-950",
  "arm-ha-880",
  "arm-uha-770",
]) {
  const f = catalog.fronts.find((x) => x.id === id)!;
  const twins = rankFrontTwins(f, 3);
  console.log(`${frontTitle(f)} → ${twins.map((t) => `${short(t.front)} ${Math.round(t.score)}%`).join(" · ")}`);
}

function short(f: { familyOfficial: string; sizeLabel: string }) {
  return `${f.familyOfficial} ${f.sizeLabel}`;
}

const art879 = setup("axis-artv2-879", "axis-advplus-ultrashort", "axis-skinny-360-45");

section("Progression ladder (ART v2 879, wing, more speed)");
const levels: RiderLevel[] = ["learning", "comfortable", "pushing"];
const ladderByLevel: Record<RiderLevel, NextSetup[]> = {
  learning: [],
  comfortable: [],
  pushing: [],
};
for (const level of levels) {
  const recs = nextSetups(art879, level, "wing", "more-speed");
  ladderByLevel[level] = recs;
  console.log(`${level} count=${recs.length} (up to 3, small → bigger, strict-forward)`);
  for (const r of recs) {
    console.log(`- ${r.headline} [${r.jump} · ${r.stepLabel}] ${r.front.familyOfficial} ${r.front.sizeLabel}`);
    if (r.otherBrandTwin) console.log(`  twin: ${describeTwin(r.otherBrandTwin)}`);
  }
}

section("Progression sample (ART v2 879, comfortable, wing, more speed)");
const recs = ladderByLevel.comfortable;
console.log(`count=${recs.length} (up to 3, small → bigger, strict-forward only)`);
for (const r of recs) {
  console.log(`- ${r.headline} [${r.jump} · ${r.stepLabel}]`);
  if (r.otherBrandTwin) console.log(`  twin: ${describeTwin(r.otherBrandTwin)}`);
}

section("Progression strict-forward (all fronts × goals)");
let strictFail = 0;
let strictCases = 0;
const goals = GOALS.map((g) => g.id) as Goal[];
for (const front of catalog.fronts) {
  const fuse = fusesByBrand(front.brand)[0];
  const tail = catalog.tails.find((t) => t.brand === front.brand);
  if (!fuse || !tail) continue;
  const s = setup(front.id, fuse.id, tail.id);
  const src = resolveSetup(s);
  if (!src) continue;
  for (const goal of goals) {
    const list = nextSetups(s, "comfortable", "wing", goal);
    strictCases += 1;
    if (list.length > 3) {
      console.log(`FAIL ${front.id} ${goal}: ${list.length} recs (max 3)`);
      strictFail += 1;
    }
    for (const r of list) {
      const ok = isStrictForward(src, r, goal);
      if (!ok) {
        console.log(`FAIL ${front.id} ${goal}: ${r.headline}`);
        strictFail += 1;
      }
      if (goal === "more-speed" || goal === "smaller-size") {
        if (
          src.front.area_cm2 != null &&
          r.front.area_cm2 != null &&
          r.front.area_cm2 > src.front.area_cm2
        ) {
          console.log(`FAIL larger area for ${goal}: ${front.id} → ${r.front.id}`);
          strictFail += 1;
        }
      }
      if (goal === "more-lift") {
        if (
          src.front.area_cm2 != null &&
          r.front.area_cm2 != null &&
          r.front.area_cm2 < src.front.area_cm2
        ) {
          console.log(`FAIL smaller area for more-lift: ${front.id} → ${r.front.id}`);
          strictFail += 1;
        }
      }
      if (goal === "tighter-turns") {
        if (
          src.fuse.fuse_length_mm != null &&
          r.fuse.fuse_length_mm != null &&
          r.fuse.fuse_length_mm > src.fuse.fuse_length_mm
        ) {
          console.log(`FAIL longer fuse for tighter-turns: ${front.id} → ${r.fuse.id}`);
          strictFail += 1;
        }
      }
      if (goal === "more-glide") {
        if (
          src.front.aspect_ratio != null &&
          r.front.aspect_ratio != null &&
          r.front.aspect_ratio < src.front.aspect_ratio
        ) {
          console.log(`FAIL lower AR for more-glide: ${front.id} → ${r.front.id}`);
          strictFail += 1;
        }
      }
    }
  }
}
console.log(`checked ${strictCases} setup×goal cases, fails=${strictFail}`);
if (strictFail) {
  throw new Error(`Progression strict-forward failed ${strictFail} check(s)`);
}

section("Progression skill ladder (no oversized first slides)");
let ladderFail = 0;
function jumpOrder(j: NextSetup["jump"]): number {
  return j === "small" ? 0 : j === "medium" ? 1 : 2;
}
const learning879 = ladderByLevel.learning;
if (learning879.some((r) => r.front.familyId === "fireball")) {
  console.log("FAIL learning ART 879 more-speed includes a Fireball family jump");
  ladderFail += 1;
}
if (learning879[0]?.front.familyId === "fireball") {
  console.log("FAIL learning ART 879 more-speed slide 1 is Fireball");
  ladderFail += 1;
}
if (learning879[0] && learning879[0].front.id !== "axis-artv2-879" && learning879[0].stepLabel.startsWith("front")) {
  console.log(
    `FAIL learning ART 879 more-speed slide 1 should be fuse/tail, got ${learning879[0].headline}`,
  );
  ladderFail += 1;
}
if (ladderByLevel.comfortable[0]?.front.familyId === "fireball") {
  console.log("FAIL comfortable ART 879 more-speed slide 1 is Fireball");
  ladderFail += 1;
}
if (ladderByLevel.pushing[0]?.front.familyId === "fireball") {
  console.log("FAIL pushing ART 879 more-speed slide 1 is Fireball");
  ladderFail += 1;
}
for (const level of levels) {
  const list = nextSetups(art879, level, "wing", "more-speed");
  for (let i = 1; i < list.length; i++) {
    if (jumpOrder(list[i].jump) < jumpOrder(list[i - 1].jump)) {
      console.log(`FAIL ${level} ART 879 jumps not small → bigger: ${list.map((r) => r.jump).join(" → ")}`);
      ladderFail += 1;
      break;
    }
  }
}
for (const front of catalog.fronts) {
  const fuse = fusesByBrand(front.brand)[0];
  const tail = catalog.tails.find((t) => t.brand === front.brand);
  if (!fuse || !tail) continue;
  const s = setup(front.id, fuse.id, tail.id);
  const src = resolveSetup(s);
  if (!src) continue;
  for (const goal of goals) {
    const learning = nextSetups(s, "learning", "wing", goal);
    for (const r of learning) {
      if (r.front.familyId !== src.front.familyId) {
        console.log(`FAIL learning family jump ${front.id} ${goal}: ${r.front.id}`);
        ladderFail += 1;
      }
      if (r.jump === "big") {
        console.log(`FAIL learning big jump ${front.id} ${goal}: ${r.headline}`);
        ladderFail += 1;
      }
    }
    for (const level of levels) {
      const list = nextSetups(s, level, "wing", goal);
      const hasSmall =
        list.length > 0 &&
        (list.some((r) => r.front.id === src.front.id) ||
          list.some((r) => r.front.familyId === src.front.familyId && r.stepLabel.includes("one size")));
      if (hasSmall && list[0] && list[0].front.familyId !== src.front.familyId) {
        console.log(`FAIL ${level} ${front.id} ${goal}: family jump as slide 1 (${list[0].headline})`);
        ladderFail += 1;
      }
      for (let i = 1; i < list.length; i++) {
        if (jumpOrder(list[i].jump) < jumpOrder(list[i - 1].jump)) {
          console.log(
            `FAIL ${level} ${front.id} ${goal} order ${list.map((r) => r.jump).join(" → ")}`,
          );
          ladderFail += 1;
          break;
        }
      }
    }
  }
}
console.log(`skill-ladder fails=${ladderFail}`);
if (ladderFail) {
  throw new Error(`Progression skill ladder failed ${ladderFail} check(s)`);
}

section(`Twin page floor (front ≥ ${MIN_FRONT_TWIN}%)`);
let twinFloorFail = 0;
for (const c of cases.slice(0, 3)) {
  const all = rankTwins(c.s, 5000);
  const kept = all.filter((t) => (t.frontScore ?? 0) >= MIN_FRONT_TWIN);
  const gated = rankTwins(c.s, 5000, { minFrontScore: MIN_FRONT_TWIN });
  const weakFront = gated.filter((t) => (t.frontScore ?? 0) < MIN_FRONT_TWIN);
  if (weakFront.length) {
    console.log(`FAIL ${c.name}: ${weakFront.length} listed with front < ${MIN_FRONT_TWIN}%`);
    twinFloorFail += 1;
  }
  if (gated.length !== kept.length) {
    console.log(
      `FAIL ${c.name}: gated ${gated.length} vs filter ${kept.length}`,
    );
    twinFloorFail += 1;
  }
  const rankedOk = gated.every((t, i) => i === 0 || t.total <= gated[i - 1].total);
  if (!rankedOk) {
    console.log(`FAIL ${c.name}: Twin page results not ranked by overall score`);
    twinFloorFail += 1;
  }
  const overallOnly = all.filter((t) => t.total >= MIN_FRONT_TWIN);
  console.log(
    `${c.name}: ${kept.length}/${all.length} front ≥ ${MIN_FRONT_TWIN}% (overall-floor would keep ${overallOnly.length}; top overall ${gated[0] ? Math.round(gated[0].total) : "—"}%, front ${gated[0] ? Math.round(gated[0].frontScore ?? 0) : "—"}%)`,
  );
}
if (twinFloorFail) {
  throw new Error(`Twin page front floor failed ${twinFloorFail} check(s)`);
}

section(`Map AR class bands + ≥${MIN_MAP_FRONT}% (same-class part-compare)`);
const bandSamples: { ar: number | null; want: ReturnType<typeof arClass> }[] = [
  { ar: null, want: null },
  { ar: 8.99, want: "carve" },
  { ar: 9, want: "mid" },
  { ar: 11.49, want: "mid" },
  { ar: 11.5, want: "high" },
];
let arFail = 0;
for (const s of bandSamples) {
  const got = arClass({ aspect_ratio: s.ar });
  if (got !== s.want) {
    console.log(`FAIL arClass(${s.ar}) = ${got}, expected ${s.want}`);
    arFail += 1;
  }
}
if (sameArClass({ aspect_ratio: null }, { aspect_ratio: 10 })) {
  console.log("FAIL null AR must not pair across classes");
  arFail += 1;
}
for (const f of catalog.fronts) {
  const twins = rankFrontTwins(f, 12, {
    sameArClass: true,
    minScore: MIN_MAP_FRONT,
  });
  for (const t of twins) {
    if (!sameArClass(f, t.front)) {
      console.log(`FAIL map twin ${f.id} → ${t.front.id} crosses AR class`);
      arFail += 1;
    }
    if (t.score < MIN_MAP_FRONT) {
      console.log(
        `FAIL map twin ${f.id} → ${t.front.id} score ${t.score.toFixed(1)} < ${MIN_MAP_FRONT}`,
      );
      arFail += 1;
    }
  }
}
const spit1180 = catalog.fronts.find((f) => f.id === "axis-spitfire-1180")!;
const spitOpen = rankFrontTwins(spit1180, 8);
const spitMap = rankFrontTwins(spit1180, 8, {
  sameArClass: true,
  minScore: MIN_MAP_FRONT,
});
const spitCross = spitOpen.filter((t) => !sameArClass(spit1180, t.front));
console.log(
  `Spitfire 1180 is ${arClass(spit1180)}; unrestricted top-8 has ${spitCross.length} other-class; map lists ${spitMap.map((t) => `${t.front.familyOfficial} ${t.front.sizeLabel}`).join(", ") || "none"}`,
);
if (spitMap.some((t) => arClass(t.front) !== "mid")) {
  console.log("FAIL Spitfire 1180 map twins must stay mid AR class");
  arFail += 1;
}
if (spitMap.some((t) => t.score < MIN_MAP_FRONT)) {
  console.log(`FAIL Spitfire 1180 map twins must be ≥${MIN_MAP_FRONT}%`);
  arFail += 1;
}
console.log(
  `arClass bands ok; map same-class ≥${MIN_MAP_FRONT}% twins checked across ${catalog.fronts.length} fronts, fails=${arFail}`,
);
if (arFail) {
  throw new Error(`Map AR class checks failed ${arFail}`);
}

section(`Quiver convert overlap collapse (≥${FRONT_OVERLAP_MIN}% same front)`);
const convert = brandConvert({
  version: 1,
  owner: null,
  updated: new Date().toISOString(),
  parts: {
    mastIds: [],
    fuseIds: [],
    frontIds: ["axis-artv2-879", "axis-surge-890", "axis-artv2-939"],
    tailIds: [],
  },
  setups: [],
  disciplines: ["wing"],
  level: "comfortable",
  goal: "more-speed",
});
if (convert) {
  console.log(
    `buyList=${convert.buyList.length} unique fronts=${convert.uniqueNeeded.fronts} overlaps=${convert.frontOverlaps.length} saved=${convert.overlapSaved}`,
  );
  for (const g of convert.frontOverlaps) {
    console.log(
      `  ${g.twinTitle} covers ${g.owned.map((o) => `${o.title} ${Math.round(o.score)}%`).join(" + ")} save ${g.save}`,
    );
  }
  if (convert.frontOverlaps.length < 1 || convert.uniqueNeeded.fronts !== 2) {
    throw new Error("Expected 85% front overlap to collapse three owned fronts into two unique buys");
  }
  const t80 = convert.coverageTiers.find((t) => t.pct === 80);
  const t90 = convert.coverageTiers.find((t) => t.pct === 90);
  if (!t80 || !t90) {
    throw new Error("Coverage tiers must exist at pct 80 and 90");
  }
  console.log(
    `coverage 80%=${t80.items.length} buys covering ${t80.coveredOwned}/${t80.totalOwned}; 90%=${t90.items.length} buys covering ${t90.coveredOwned}/${t90.totalOwned}`,
  );
  if (t80.items.length > t90.items.length) {
    throw new Error("80% coverage must need fewer or equal unique buys vs 90%");
  }
  if (!t80.items.some((i) => i.kind === "fuse")) {
    throw new Error("80% coverage must include a fuse (complete rideable kit)");
  }
  assertCompleteKit("overlap 3 fronts", convert);
  assertRiderConvertCopy("overlap 3 fronts", convert);
  const none = brandConvert(
    quiverDoc({
      parts: {
        mastIds: [],
        fuseIds: [],
        frontIds: ["axis-artv2-879", "axis-artv2-819"],
        tailIds: [],
      },
    }),
    { frontIds: [], tailIds: [], fuseIds: [], mastIds: [] },
  );
  console.log(`unchecked all: buyList=${none?.buyList.length ?? 0} rows=${none?.rows.length ?? 0}`);
  if (!none?.coverageTiers.some((t) => t.pct === 80) || !none.coverageTiers.some((t) => t.pct === 90)) {
    throw new Error("Empty include still returns 80 and 90 coverage tiers");
  }
  assertCompleteKit("empty include (owns fronts, unchecked all)", none);
}

section("Quiver convert 80/90 coverage + HA range (5 ART fronts)");
const rangeConvert = brandConvert(
  quiverDoc({
    parts: {
      mastIds: [],
      fuseIds: [],
      frontIds: [
        "axis-artv2-1099",
        "axis-artv2-999",
        "axis-artv2-939",
        "axis-artv2-879",
        "axis-artv2-819",
      ],
      tailIds: [],
    },
  }),
);
if (!rangeConvert) {
  throw new Error("Expected convert for five ART v2 fronts");
}
const r80 = rangeConvert.coverageTiers.find((t) => t.pct === 80);
const r90 = rangeConvert.coverageTiers.find((t) => t.pct === 90);
if (!r80 || !r90) {
  throw new Error("Coverage tiers must exist at pct 80 and 90");
}
console.log(
  `5 ART fronts: unique=${rangeConvert.uniqueNeeded.fronts} 80%=${r80.items.length} 90%=${r90.items.length} ranges=${rangeConvert.rangeSummaries.map((r) => r.note).join(" | ") || "(none)"}`,
);
if (r80.items.length > r90.items.length) {
  throw new Error("80% coverage must need fewer or equal unique buys vs 90%");
}
if (!r80.items.some((i) => i.kind === "fuse")) {
  throw new Error("5 ART 80% kit must include a fuse");
}
assertCompleteKit("5 ART fronts", rangeConvert);
assertRiderConvertCopy("5 ART fronts", rangeConvert);
const haRange = rangeConvert.rangeSummaries.find((r) => r.kind === "front" && r.familyOfficial === "HA Front Foil");
if (rangeConvert.uniqueNeeded.fronts >= 3 && !haRange) {
  throw new Error("Expected HA Front Foil progressive range when 3+ HA sizes are suggested");
}

section("Quiver convert complete kits (80/90 always rideable)");
const fullKit = brandConvert(
  quiverDoc({
    parts: {
      mastIds: ["axis-al19-750"],
      fuseIds: ["axis-advplus-ultrashort"],
      frontIds: ["axis-artv2-879", "axis-artv2-939"],
      tailIds: ["axis-skinny-360-45"],
    },
  }),
);
assertCompleteKit("full quiver fronts+tails+fuses+masts", fullKit);
const full80 = fullKit!.coverageTiers.find((t) => t.pct === 80)!;
console.log(
  `full kit 80%: ${full80.items.map((i) => `${i.kind}:${i.twinTitle}`).join(" · ")}`,
);

const missingFuse = brandConvert(
  quiverDoc({
    parts: {
      mastIds: ["axis-al19-750"],
      fuseIds: [],
      frontIds: ["axis-artv2-879", "axis-spitfire-840"],
      tailIds: ["axis-skinny-360-45"],
    },
  }),
);
assertCompleteKit("missing owned fuse", missingFuse);
const missingFuse80 = missingFuse!.coverageTiers.find((t) => t.pct === 80)!;
const kitFuse = missingFuse80.items.find((i) => i.kind === "fuse");
if (!kitFuse || kitFuse.covers.length > 0) {
  throw new Error(
    `Expected kit-only fuse when none checked, got ${
      kitFuse ? `${kitFuse.twinTitle} covers=${kitFuse.covers.length}` : "none"
    }`,
  );
}
if (!kitFuse.kitOnly && !kitFuse.note?.includes("complete setup")) {
  throw new Error(`Kit fuse note should mark complete setup, got ${kitFuse.note ?? "(none)"}`);
}
console.log(`missing fuse → kit fuse ${kitFuse.twinTitle} (${kitFuse.note})`);

const missingMast = brandConvert(
  quiverDoc({
    parts: {
      mastIds: [],
      fuseIds: ["axis-advplus-short", "axis-advplus-ultrashort"],
      frontIds: ["axis-artv2-879"],
      tailIds: ["axis-skinny-360-45"],
    },
    disciplines: ["surf"],
    goal: "tighter-turns",
  }),
);
assertCompleteKit("missing owned mast", missingMast);
const missingMast80 = missingMast!.coverageTiers.find((t) => t.pct === 80)!;
const kitMast = missingMast80.items.find((i) => i.kind === "mast");
if (!kitMast || kitMast.covers.length > 0) {
  throw new Error("Expected kit-only mast when none checked");
}
console.log(`missing mast → kit mast ${kitMast.twinTitle}`);

const uncheckedKinds = brandConvert(
  quiverDoc({
    parts: {
      mastIds: ["axis-al19-750"],
      fuseIds: ["axis-advplus-ultrashort"],
      frontIds: ["axis-artv2-879"],
      tailIds: ["axis-skinny-360-45"],
    },
  }),
  { frontIds: [], tailIds: [], fuseIds: [], mastIds: [] },
);
assertCompleteKit("owns all kinds, unchecked all", uncheckedKinds);
const unchecked80 = uncheckedKinds!.coverageTiers.find((t) => t.pct === 80)!;
if (unchecked80.items.some((i) => i.covers.length > 0)) {
  throw new Error("Unchecked include should not list covers on kit items");
}
if (unchecked80.totalOwned !== 0) {
  throw new Error("Unchecked include totalOwned should be 0");
}
console.log(
  `unchecked all kinds: 80%=${unchecked80.items.length} kit-only, 90%=${
    uncheckedKinds!.coverageTiers.find((t) => t.pct === 90)!.items.length
  }`,
);

section("Quiver fuse ladder adjacency (Short + Ultra Short → Crazy Short)");
const fuseQuiver = quiverDoc({
  parts: {
    mastIds: ["axis-al19-750"],
    fuseIds: ["axis-advplus-short", "axis-advplus-ultrashort"],
    frontIds: ["axis-spitfire-840"],
    tailIds: ["axis-surfskinny-320-48"],
  },
  disciplines: ["surf"],
  level: "comfortable",
  goal: "tighter-turns",
});
const fuseBuys = recommendBuys(fuseQuiver);
const fuseRecIds = fuseBuys.filter((r) => r.kind === "fuse").map((r) => r.partId);
console.log(`fuse recs: ${fuseRecIds.join(", ") || "(none)"}`);
if (!fuseRecIds.includes("axis-advplus-crazyshort")) {
  throw new Error(
    `Expected Crazy Short (axis-advplus-crazyshort) as next shorter fuse, got ${fuseRecIds.join(", ") || "(none)"}`,
  );
}
if (fuseRecIds.includes("axis-advplus-sillyshort")) {
  throw new Error("Silly Short must not be the next fuse buy while Crazy Short is unowned");
}

section("Progression fuse steps stay adjacent");
let fuseAdjFail = 0;
const fromShort = setup("axis-spitfire-840", "axis-advplus-short", "axis-surfskinny-320-48");
const tightFromShort = nextSetups(fromShort, "comfortable", "surf", "tighter-turns");
const fuseStep = tightFromShort.find((r) => r.front.id === "axis-spitfire-840" && r.fuse.id !== "axis-advplus-short");
console.log(
  `tighter-turns from Short: ${fuseStep ? `${fuseStep.fuse.id} [${fuseStep.stepLabel}]` : "no fuse-only step"}`,
);
if (fuseStep && fuseStep.fuse.id !== "axis-advplus-ultrashort") {
  console.log(`FAIL progression skipped Ultra Short: ${fuseStep.fuse.id}`);
  fuseAdjFail += 1;
}
for (const front of catalog.fronts) {
  const fuse = fusesByBrand(front.brand)[0];
  const tail = catalog.tails.find((t) => t.brand === front.brand);
  if (!fuse || !tail) continue;
  const s = setup(front.id, fuse.id, tail.id);
  const src = resolveSetup(s);
  if (!src) continue;
  for (const goal of ["tighter-turns", "more-glide"] as Goal[]) {
    const list = nextSetups(s, "comfortable", "wing", goal);
    for (const r of list) {
      if (r.front.id !== src.front.id || r.fuse.id === src.fuse.id) continue;
      const expect = goal === "tighter-turns" ? shorterFuse(src.fuse) : longerFuse(src.fuse);
      if (!expect || r.fuse.id !== expect.id) {
        console.log(`FAIL ${front.id} ${goal}: fuse ${src.fuse.id} → ${r.fuse.id} (want ${expect?.id ?? "none"})`);
        fuseAdjFail += 1;
      }
    }
  }
}
console.log(`fuse-adjacency fails=${fuseAdjFail}`);
if (fuseAdjFail) {
  throw new Error(`Progression fuse adjacency failed ${fuseAdjFail} check(s)`);
}

section("Quiver named-setup upsert");
const setupSeed = quiverDoc({
  parts: { mastIds: [], fuseIds: [], frontIds: [], tailIds: [] },
});
const named = newNamedSetup({
  label: "Daily",
  brand: "axis",
  mastId: "axis-al19-750",
  fuseId: "axis-advplus-short",
  frontId: "axis-artv2-879",
  tailId: "axis-skinny-360-45",
});
const addedSetup = upsertNamedSetup(setupSeed, named);
if (addedSetup.setups.length !== 1 || addedSetup.setups[0].id !== named.id) {
  throw new Error("upsert should insert a named setup with stable id");
}
if (!addedSetup.parts.frontIds.includes("axis-artv2-879")) {
  throw new Error("upsert should ensure setup parts are in inventory");
}
const editedSetup = upsertNamedSetup(addedSetup, {
  ...named,
  label: "Daily wing",
  frontId: "axis-surge-950",
});
if (editedSetup.setups.length !== 1) {
  throw new Error("edit must update the existing setup by id, not append");
}
if (editedSetup.setups[0].label !== "Daily wing" || editedSetup.setups[0].frontId !== "axis-surge-950") {
  throw new Error("edit did not persist label/parts on the same id");
}
if (
  !editedSetup.parts.frontIds.includes("axis-surge-950") ||
  !editedSetup.parts.frontIds.includes("axis-artv2-879")
) {
  throw new Error("edit should add new parts without dropping previous inventory");
}
console.log(`upsert edit in place: ${editedSetup.setups[0].id} → ${editedSetup.setups[0].label}`);

section("Quiver UI prefs (foil-twin-quiver-ui-v1)");
if (QUIVER_UI_STORAGE_KEY !== "foil-twin-quiver-ui-v1") {
  throw new Error(`QUIVER_UI_STORAGE_KEY must stay foil-twin-quiver-ui-v1, got ${QUIVER_UI_STORAGE_KEY}`);
}
if (QUIVER_STORAGE_KEY !== "foil-twin-quiver-v1") {
  throw new Error("inventory key must stay foil-twin-quiver-v1");
}
const uiDefault = parseQuiverUi(null);
if (
  uiDefault.version !== 1 ||
  uiDefault.sections.gaps !== true ||
  uiDefault.sections.nextToBuy !== true ||
  uiDefault.sections.brandConvert !== false ||
  uiDefault.sections.kit80 !== true ||
  uiDefault.sections.kit90 !== true ||
  uiDefault.currency !== "USD"
) {
  throw new Error(`UI prefs defaults wrong: ${JSON.stringify(uiDefault)}`);
}
if (
  DEFAULT_QUIVER_UI.sections.gaps !== true ||
  DEFAULT_QUIVER_UI.sections.nextToBuy !== true ||
  DEFAULT_QUIVER_UI.sections.brandConvert !== false ||
  DEFAULT_QUIVER_UI.sections.kit80 !== true ||
  DEFAULT_QUIVER_UI.sections.kit90 !== true ||
  DEFAULT_QUIVER_UI.currency !== "USD"
) {
  throw new Error("DEFAULT_QUIVER_UI: gaps/nextToBuy/kit80/kit90 open, brandConvert closed; currency USD");
}
const uiOn = parseQuiverUi({
  version: 1,
  sections: { gaps: false, nextToBuy: true, brandConvert: true, kit80: false, kit90: true },
  currency: "CAD",
});
if (
  uiOn.sections.gaps !== false ||
  uiOn.sections.brandConvert !== true ||
  uiOn.sections.kit80 !== false ||
  uiOn.sections.kit90 !== true ||
  uiOn.currency !== "CAD"
) {
  throw new Error("parseQuiverUi should honor boolean section flags and currency");
}
const uiLegacy = parseQuiverUi({
  version: 1,
  sections: { gaps: true, nextToBuy: true, brandConvert: false },
});
if (uiLegacy.currency !== "USD") {
  throw new Error("prefs without currency must default to USD");
}
if (uiLegacy.sections.kit80 !== true || uiLegacy.sections.kit90 !== true) {
  throw new Error("legacy prefs without kit80/kit90 must default both kits open");
}
const uiJunk = parseQuiverUi({ version: 1, owner: null, parts: { frontIds: [] } });
if (
  uiJunk.sections.gaps !== true ||
  uiJunk.sections.nextToBuy !== true ||
  uiJunk.sections.brandConvert !== false ||
  uiJunk.sections.kit80 !== true ||
  uiJunk.sections.kit90 !== true ||
  uiJunk.currency !== "USD"
) {
  throw new Error("inventory-shaped blobs must not parse as UI prefs");
}
console.log(
  `prefs key=${QUIVER_UI_STORAGE_KEY} inventory=${QUIVER_STORAGE_KEY} default convert collapsed kits open currency=${uiDefault.currency}`,
);

section("Manufacturer prices");
if (!(FX_USD_TO_CAD > 0) || !Number.isFinite(FX_USD_TO_CAD)) {
  throw new Error(`bad FX_USD_TO_CAD: ${FX_USD_TO_CAD}`);
}
let priced = 0;
for (const [id, row] of Object.entries(PART_PRICES_USD)) {
  if (!(typeof row.usd === "number") || !Number.isFinite(row.usd) || row.usd < 0) {
    throw new Error(`bad price for ${id}: ${JSON.stringify(row)}`);
  }
  const got = getPartPrice(id);
  if (got.usd !== row.usd) throw new Error(`getPartPrice usd mismatch for ${id}`);
  if (got.cad == null || got.cad < 0) throw new Error(`CAD missing/negative for ${id}`);
  const expect = usdToCad(row.usd);
  if (got.cad !== expect) throw new Error(`CAD FX mismatch for ${id}: ${got.cad} vs ${expect}`);
  priced += 1;
}
const allIds = [
  ...catalog.fronts.map((p) => p.id),
  ...catalog.tails.map((p) => p.id),
  ...catalog.fuselages.map((p) => p.id),
  ...catalog.masts.map((p) => p.id),
];
const unpriced = allIds.filter((id) => getPartPrice(id).usd == null);
console.log(`priced USD/CAD ${priced}/${allIds.length}; unpriced ${unpriced.length}`);
if (unpriced.length) console.log(`unpriced: ${unpriced.join(", ")}`);

section("Quiver gaps list missing only");
const covered = analyzeGaps(
  quiverDoc({
    disciplines: ["wing", "surf"],
    parts: {
      mastIds: ["axis-al19-750"],
      fuseIds: ["axis-advplus-short"],
      frontIds: ["axis-artv2-879", "axis-surge-950"],
      tailIds: ["axis-skinny-360-45", "axis-surfskinny-320-48"],
    },
  }),
);
for (const g of covered) {
  const haveBlob = g.have.join(" · ");
  if (/Mast coverage:|Fronts that fit|Fuses:|Tails:/.test(haveBlob)) {
    throw new Error(`${g.discipline} dumped inventory into have: ${haveBlob}`);
  }
  if (g.have.length > 0) {
    throw new Error(`${g.discipline} have should stay empty (gaps-only UI), got ${haveBlob}`);
  }
}
const raceGaps = analyzeGaps(
  quiverDoc({
    disciplines: ["race"],
    parts: {
      mastIds: ["axis-al19-450"],
      fuseIds: [],
      frontIds: ["axis-spitfire-840"],
      tailIds: ["axis-surfskinny-320-48"],
    },
  }),
);
const race = raceGaps.find((g) => g.discipline === "race");
if (!race || race.missing.length < 3) {
  throw new Error(`race should report mast/front/fuse/tail gaps, got ${race?.missing.join(" | ") ?? "none"}`);
}
if (race.have.length) {
  throw new Error(`race have should not list inventory: ${race.have.join(" · ")}`);
}
if (race.missing.some((m) => /You own /.test(m))) {
  throw new Error(`race missing text listed inventory: ${race.missing.join(" | ")}`);
}
console.log(`race gaps (${race.missing.length}): ${race.missing.join(" | ")}`);

section("Mast family twin map");
const expectPairs: [string, string][] = [
  ["axis-pc-hm", "arm-perf-mk2"],
  ["arm-perf-mk2", "axis-pc-hm"],
  ["axis-pro-uhm", "arm-perf-x"],
  ["axis-kaiwi", "arm-perf-x"],
  ["arm-perf-x", "axis-pro-uhm"],
  ["axis-al-19", "arm-alloy"],
  ["axis-pc", "arm-carbon-mk2"],
  ["axis-fatty", "arm-carbon-mk2"],
  ["axis-fd-hm", "arm-fd-assist"],
  ["axis-fd-uhm", "arm-fd-assist"],
];
for (const [from, to] of expectPairs) {
  const got = twinMastFamily(from as keyof typeof MAST_FAMILY_TWIN);
  if (got !== to) throw new Error(`mast family map ${from} → ${got}, expected ${to}`);
}
console.log(`mast family map entries=${Object.keys(MAST_FAMILY_TWIN).length}`);

section("Mast twins (family + length)");
function assertMastFamily(fromId: string, expectFamily: string) {
  const m = catalog.masts.find((x) => x.id === fromId);
  if (!m) throw new Error(`missing mast ${fromId}`);
  const twin = nearestMast(fromId);
  if (!twin) throw new Error(`no twin for ${fromId}`);
  if (twin.familyId !== expectFamily) {
    throw new Error(
      `${fromId} twined to ${twin.id} (${twin.familyId}), expected family ${expectFamily}`,
    );
  }
  console.log(
    `${m.familyOfficial} ${m.sizeLabel} → ${twin.familyOfficial} ${twin.sizeLabel} [${twin.familyId}]`,
  );
}
assertMastFamily("axis-pchm-900", "arm-perf-mk2");
assertMastFamily("axis-pchm-750", "arm-perf-mk2");
assertMastFamily("axis-pro-800", "arm-perf-x");
assertMastFamily("axis-kaiwi-780", "arm-perf-x");
assertMastFamily("arm-pmk2-795", "axis-pc-hm");
assertMastFamily("arm-px-795", "axis-pro-uhm");
assertMastFamily("axis-al19-750", "arm-alloy");
assertMastFamily("axis-pc-900", "arm-carbon-mk2");

for (const id of ["axis-al19-750", "axis-pro-800", "arm-pmk2-795", "arm-alloy-72"]) {
  const m = catalog.masts.find((x) => x.id === id)!;
  const twins = rankMastTwins(m, 2);
  if (!twins.length) throw new Error(`rankMastTwins empty for ${id}`);
  const twinFam = twinMastFamily(m.familyId);
  if (twins[0].part.familyId !== twinFam) {
    throw new Error(`top twin for ${id} not in family ${twinFam}`);
  }
  console.log(
    `${m.familyOfficial} ${m.sizeLabel} → ${twins.map((t) => `${t.part.familyOfficial} ${t.part.sizeLabel} ${Math.round(t.score)}%`).join(" · ")}`,
  );
}
