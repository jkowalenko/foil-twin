import { catalog } from "../data/catalog";
import { rankFrontTwins, rankMastTwins, rankTwins } from "./match";
import { describeTwin } from "./match";
import { nextSetups } from "./progression";
import type { Setup } from "../data/types";
import { frontTitle } from "./format";

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
console.log(`count=${recs.length} (expect 3)`);
for (const r of recs) {
  console.log(`- ${r.headline} [${r.jump}]`);
  if (r.otherBrandTwin) console.log(`  twin: ${describeTwin(r.otherBrandTwin)}`);
}

section("Mast twins (length)");
for (const id of ["axis-al19-750", "axis-pro-800", "arm-pmk2-795", "arm-alloy-72"]) {
  const m = catalog.masts.find((x) => x.id === id)!;
  const twins = rankMastTwins(m, 2);
  console.log(
    `${m.familyOfficial} ${m.sizeLabel} → ${twins.map((t) => `${t.part.familyOfficial} ${t.part.sizeLabel} ${Math.round(t.score)}%`).join(" · ")}`,
  );
}
