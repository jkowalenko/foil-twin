import { catalog, fusesByBrand } from "../data/catalog";
import { GOALS } from "../data/labels";
import type { Goal, Setup } from "../data/types";
import { frontTitle } from "./format";
import {
  MIN_COMPLETE_TWIN,
  describeTwin,
  rankFrontTwins,
  rankMastTwins,
  rankTwins,
  resolveSetup,
} from "./match";
import { isStrictForward, nextSetups } from "./progression";
import { FRONT_OVERLAP_MIN, brandConvert } from "./quiver";

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

section("Progression sample (ART v2 879, comfortable, wing, more speed)");
const recs = nextSetups(
  setup("axis-artv2-879", "axis-advplus-ultrashort", "axis-skinny-360-45"),
  "comfortable",
  "wing",
  "more-speed",
);
console.log(`count=${recs.length} (up to 3, strict-forward only)`);
for (const r of recs) {
  console.log(`- ${r.headline} [${r.jump}]`);
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

section(`Twin page floor (${MIN_COMPLETE_TWIN}% complete setups)`);
for (const c of cases.slice(0, 3)) {
  const all = rankTwins(c.s, 80);
  const kept = all.filter((t) => t.total >= MIN_COMPLETE_TWIN);
  console.log(
    `${c.name}: ${kept.length}/${all.length} ≥ ${MIN_COMPLETE_TWIN}% (top ${all[0] ? Math.round(all[0].total) : "—" }%)`,
  );
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
  const none = brandConvert(
    {
      version: 1,
      owner: null,
      updated: new Date().toISOString(),
      parts: {
        mastIds: [],
        fuseIds: [],
        frontIds: ["axis-artv2-879", "axis-artv2-819"],
        tailIds: [],
      },
      setups: [],
      disciplines: ["wing"],
      level: "comfortable",
      goal: "more-speed",
    },
    { frontIds: [], tailIds: [], fuseIds: [], mastIds: [] },
  );
  console.log(`unchecked all: buyList=${none?.buyList.length ?? 0} rows=${none?.rows.length ?? 0}`);
}

section("Mast twins (length)");
for (const id of ["axis-al19-750", "axis-pro-800", "arm-pmk2-795", "arm-alloy-72"]) {
  const m = catalog.masts.find((x) => x.id === id)!;
  const twins = rankMastTwins(m, 2);
  console.log(
    `${m.familyOfficial} ${m.sizeLabel} → ${twins.map((t) => `${t.part.familyOfficial} ${t.part.sizeLabel} ${Math.round(t.score)}%`).join(" · ")}`,
  );
}
