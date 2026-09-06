import {
  catalog,
  fuseById,
  frontById,
  mastById,
  tailById,
} from "../data/catalog";
import { QUIVER_STORAGE_KEY } from "../data/labels";
import type {
  Brand,
  Discipline,
  FrontWing,
  Fuselage,
  Goal,
  Mast,
  NamedSetup,
  QuiverDoc,
  Setup,
  TailWing,
} from "../data/types";
import { brandName, otherBrand, shortFront, shortMast } from "./format";
import {
  nearestFront,
  nearestFuse,
  nearestMast,
  nearestTail,
  rankFrontTwins,
  rankTwins,
  resolveSetup,
} from "./match";
import { longerFuse, nextSetups, shorterFuse } from "./progression";

export const EMPTY_QUIVER: QuiverDoc = {
  version: 1,
  owner: null,
  updated: new Date().toISOString(),
  parts: { mastIds: [], fuseIds: [], frontIds: [], tailIds: [] },
  setups: [],
  disciplines: ["wing"],
  level: "comfortable",
  goal: "more-speed",
};

export function loadQuiver(): QuiverDoc {
  try {
    const raw = localStorage.getItem(QUIVER_STORAGE_KEY);
    if (!raw) return { ...EMPTY_QUIVER, updated: new Date().toISOString() };
    const parsed = JSON.parse(raw) as QuiverDoc;
    if (parsed.version !== 1 || !parsed.parts) {
      return { ...EMPTY_QUIVER, updated: new Date().toISOString() };
    }
    const parts = {
      mastIds: parsed.parts.mastIds.filter((id) => !!mastById(id)),
      fuseIds: parsed.parts.fuseIds.filter((id) => !!fuseById(id)),
      frontIds: parsed.parts.frontIds.filter((id) => !!frontById(id)),
      tailIds: parsed.parts.tailIds.filter((id) => !!tailById(id)),
    };
    const setups = (parsed.setups ?? []).filter((s) => {
      const mast = mastById(s.mastId);
      const fuse = fuseById(s.fuseId);
      const front = frontById(s.frontId);
      const tail = tailById(s.tailId);
      return (
        mast &&
        fuse &&
        front &&
        tail &&
        mast.brand === s.brand &&
        fuse.brand === s.brand &&
        front.brand === s.brand &&
        tail.brand === s.brand
      );
    });
    const disciplines = (parsed.disciplines ?? []).filter((d) =>
      ["wing", "surf", "downwind", "wake", "race"].includes(d),
    );
    return {
      version: 1,
      owner: null,
      updated: parsed.updated ?? new Date().toISOString(),
      parts,
      setups,
      disciplines: disciplines.length ? disciplines : ["wing"],
      level: parsed.level ?? "comfortable",
      goal: parsed.goal ?? "more-speed",
    };
  } catch {
    return { ...EMPTY_QUIVER, updated: new Date().toISOString() };
  }
}

export function saveQuiver(doc: QuiverDoc) {
  const next: QuiverDoc = { ...doc, version: 1, owner: null, updated: new Date().toISOString() };
  localStorage.setItem(QUIVER_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function majorityBrand(doc: QuiverDoc): Brand {
  let axis = 0;
  let arm = 0;
  const count = (brand: Brand) => {
    if (brand === "axis") axis += 1;
    else arm += 1;
  };
  for (const id of doc.parts.frontIds) {
    const p = frontById(id);
    if (p) count(p.brand);
  }
  for (const id of doc.parts.mastIds) {
    const p = mastById(id);
    if (p) count(p.brand);
  }
  for (const id of doc.parts.fuseIds) {
    const p = fuseById(id);
    if (p) count(p.brand);
  }
  for (const id of doc.parts.tailIds) {
    const p = tailById(id);
    if (p) count(p.brand);
  }
  if (arm > axis) return "armstrong";
  return "axis";
}

type Lane = "carve" | "surf" | "allround" | "glide";

function frontLane(f: FrontWing): Lane {
  if (f.familyId === "spitfire" || f.familyId === "ma-mk2") return "carve";
  if (f.familyId === "surge") return "surf";
  if (f.familyId === "fireball" || f.familyId === "uha") return "glide";
  return "allround";
}

function ownedFronts(doc: QuiverDoc): FrontWing[] {
  return doc.parts.frontIds.map(frontById).filter((x): x is FrontWing => !!x);
}
function ownedMasts(doc: QuiverDoc): Mast[] {
  return doc.parts.mastIds.map(mastById).filter((x): x is Mast => !!x);
}
function ownedFuses(doc: QuiverDoc): Fuselage[] {
  return doc.parts.fuseIds.map(fuseById).filter((x): x is Fuselage => !!x);
}
function ownedTails(doc: QuiverDoc): TailWing[] {
  return doc.parts.tailIds.map(tailById).filter((x): x is TailWing => !!x);
}

/** Length bands from manufacturer usage notes, not invented performance numbers. */
const MAST_BAND: Record<Discipline, { min: number; ideal: string }> = {
  wing: { min: 600, ideal: "about 75–90 cm for open-water winging" },
  surf: { min: 450, ideal: "about 60–75 cm so you can still pump and not spear" },
  downwind: { min: 750, ideal: "about 82–105 cm for swell and touchdown margin" },
  wake: { min: 450, ideal: "about 45–68 cm — short enough for the boat wake" },
  race: { min: 800, ideal: "about 85–105 cm for clearance at speed" },
};

const WANT_LANES: Record<Discipline, Lane[]> = {
  wing: ["allround", "glide", "surf"],
  surf: ["carve", "surf", "allround"],
  downwind: ["glide", "allround"],
  wake: ["carve", "surf"],
  race: ["glide", "allround"],
};

const WANT_TAIL: Record<Discipline, TailWing["role"] | null> = {
  wing: null,
  surf: "surf",
  downwind: "speed",
  wake: "surf",
  race: "speed",
};

export type QuiverGap = {
  discipline: Discipline;
  missing: string[];
  have: string[];
};

export function analyzeGaps(doc: QuiverDoc): QuiverGap[] {
  const fronts = ownedFronts(doc);
  const masts = ownedMasts(doc).filter((m) => !m.motorIntegrated);
  const fuses = ownedFuses(doc);
  const tails = ownedTails(doc);
  return doc.disciplines.map((discipline) => {
    const missing: string[] = [];
    const have: string[] = [];
    const band = MAST_BAND[discipline];
    const mastOk = masts.filter((m) => (m.length_mm ?? 0) >= band.min);
    if (!masts.length) {
      missing.push(`No mast yet. ${band.ideal}.`);
    } else if (!mastOk.length) {
      const longest = [...masts].sort((a, b) => (b.length_mm ?? 0) - (a.length_mm ?? 0))[0];
      missing.push(
        `Mast is short for ${discipline}: longest you own is ${shortMast(longest)}. ${band.ideal}.`,
      );
    } else {
      have.push(`Mast coverage: ${mastOk.map(shortMast).join(", ")}`);
    }

    const lanes = WANT_LANES[discipline];
    const laneHits = fronts.filter((f) => lanes.includes(frontLane(f)));
    if (!fronts.length) {
      missing.push("No front wing in the quiver.");
    } else if (!laneHits.length) {
      missing.push(
        `No ${discipline}-shaped front yet. You own ${fronts.map(shortFront).join(", ")} — look at ${lanes.join(" / ")} families.`,
      );
    } else {
      have.push(`Fronts that fit ${discipline}: ${laneHits.map(shortFront).join(", ")}`);
    }

    if (!fuses.length) {
      missing.push("No fuselage. Twin matching still needs a fuse even if mast length is the bigger feel change.");
    } else {
      have.push(`Fuses: ${fuses.map((f) => f.sizeLabel).join(", ")}`);
    }

    const role = WANT_TAIL[discipline];
    if (!tails.length) {
      missing.push("No tail / stabilizer.");
    } else if (role && !tails.some((t) => t.role === role)) {
      missing.push(
        `${discipline} usually wants a ${role === "speed" ? "Skinny / Speed (glide, locked yaw)" : "Surf (roll + yaw)"} tail. You own ${tails.map((t) => `${t.familyOfficial} ${t.sizeLabel}`).join(", ")}.`,
      );
    } else {
      have.push(`Tails: ${tails.map((t) => `${t.familyOfficial} ${t.sizeLabel}`).join(", ")}`);
    }

    if (fronts.length && fuses.length && tails.length && mastOk.length) {
      have.push("You can bolt together a complete setup for this discipline.");
    }

    return { discipline, missing, have };
  });
}

export type BuyRec = {
  kind: "front" | "tail" | "fuse" | "mast";
  partId: string;
  title: string;
  why: string;
  brand: Brand;
};

function pickFrontForLane(brand: Brand, lanes: Lane[], around: number | null): FrontWing | null {
  const pool = catalog.fronts.filter((f) => f.brand === brand && lanes.includes(frontLane(f)));
  if (!pool.length) return null;
  if (around == null) {
    return [...pool].sort((a, b) => (b.area_cm2 ?? 0) - (a.area_cm2 ?? 0))[Math.floor(pool.length / 2)];
  }
  return [...pool].sort(
    (a, b) =>
      Math.abs((a.area_cm2 ?? around) - around) - Math.abs((b.area_cm2 ?? around) - around),
  )[0];
}

function pickMastForBand(brand: Brand, min: number, owned: Mast[]): Mast | null {
  const pool = catalog.masts.filter(
    (m) => m.brand === brand && !m.motorIntegrated && (m.length_mm ?? 0) >= min,
  );
  if (!pool.length) return null;
  const unused = pool.filter((m) => !owned.some((o) => o.id === m.id));
  const src = unused.length ? unused : pool;
  return [...src].sort((a, b) => (a.length_mm ?? 0) - (b.length_mm ?? 0))[0];
}

function pickTailRole(brand: Brand, role: TailWing["role"], owned: TailWing[]): TailWing | null {
  const pool = catalog.tails.filter((t) => t.brand === brand && t.role === role);
  if (!pool.length) return null;
  const unused = pool.filter((t) => !owned.some((o) => o.id === t.id));
  const src = unused.length ? unused : pool;
  return [...src].sort((a, b) => (b.area_cm2 ?? 0) - (a.area_cm2 ?? 0))[Math.floor(src.length / 3)];
}

/**
 * Walk the same-family fuse ladder one adjacent step from the extreme owned
 * length (shortest for "shorter", longest for "longer"). Never jumps to the
 * unused extreme while an intermediate catalog SKU exists.
 */
function pickAdjacentFuse(
  brand: Brand,
  owned: Fuselage[],
  direction: "shorter" | "longer",
): Fuselage | null {
  const inBrand = owned.filter((f) => f.brand === brand && f.fuse_length_mm != null);
  if (!inBrand.length) return null;
  const ordered = [...inBrand].sort(
    (a, b) => (a.fuse_length_mm ?? 0) - (b.fuse_length_mm ?? 0),
  );
  const anchor = direction === "shorter" ? ordered[0] : ordered[ordered.length - 1];
  const next = direction === "shorter" ? shorterFuse(anchor) : longerFuse(anchor);
  if (!next || owned.some((o) => o.id === next.id)) return null;
  return next;
}

function pickShorterFuse(brand: Brand, owned: Fuselage[]): Fuselage | null {
  return pickAdjacentFuse(brand, owned, "shorter");
}

export function recommendBuys(doc: QuiverDoc): BuyRec[] {
  const brand = majorityBrand(doc);
  const fronts = ownedFronts(doc);
  const masts = ownedMasts(doc);
  const fuses = ownedFuses(doc);
  const tails = ownedTails(doc);
  const midArea =
    fronts.map((f) => f.area_cm2).filter((n): n is number => n != null).sort((a, b) => a - b)[
      Math.floor(fronts.length / 2)
    ] ?? null;
  const recs: BuyRec[] = [];
  const seen = new Set<string>();
  const push = (rec: BuyRec) => {
    if (seen.has(rec.partId)) return;
    if (
      (rec.kind === "front" && doc.parts.frontIds.includes(rec.partId)) ||
      (rec.kind === "tail" && doc.parts.tailIds.includes(rec.partId)) ||
      (rec.kind === "fuse" && doc.parts.fuseIds.includes(rec.partId)) ||
      (rec.kind === "mast" && doc.parts.mastIds.includes(rec.partId))
    ) {
      return;
    }
    seen.add(rec.partId);
    recs.push(rec);
  };

  for (const d of doc.disciplines) {
    const band = MAST_BAND[d];
    const mastOk = masts.filter((m) => !m.motorIntegrated && (m.length_mm ?? 0) >= band.min);
    if (!mastOk.length) {
      const m = pickMastForBand(brand, band.min, masts);
      if (m) {
        push({
          kind: "mast",
          partId: m.id,
          title: `${m.familyOfficial} ${m.sizeLabel}`,
          why: `${d}: ${band.ideal}. Prefer ${brandName(brand)} so hardware stays in-family.`,
          brand,
        });
      }
    }
    const lanes = WANT_LANES[d];
    if (!fronts.some((f) => lanes.includes(frontLane(f)))) {
      const f = pickFrontForLane(brand, lanes, midArea);
      if (f) {
        push({
          kind: "front",
          partId: f.id,
          title: `${f.familyOfficial} ${f.sizeLabel}`,
          why: `${d} wants a ${lanes.join("/")} outline. ${f.familyOfficial} ${f.sizeLabel} is the closest ${brandName(brand)} published size to what you already ride.`,
          brand,
        });
      }
    }
    const role = WANT_TAIL[d];
    if (role && !tails.some((t) => t.role === role)) {
      const t = pickTailRole(brand, role, tails);
      if (t) {
        push({
          kind: "tail",
          partId: t.id,
          title: `${t.familyOfficial} ${t.sizeLabel}`,
          why: `${d}: add a ${role === "speed" ? "Skinny / Speed" : "Surf"} tail so yaw matches the job.`,
          brand,
        });
      }
    }
    if (!fuses.length) {
      const fuse = catalog.fuselages.find((f) => f.brand === brand);
      if (fuse) {
        push({
          kind: "fuse",
          partId: fuse.id,
          title: fuse.sizeLabel,
          why: "A fuselage is the spine. Start with the brand's mid length.",
          brand,
        });
      }
    } else if (d === "surf" || d === "wake") {
      const shortest = [...fuses].sort((a, b) => (a.fuse_length_mm ?? 9999) - (b.fuse_length_mm ?? 9999))[0];
      if ((shortest?.fuse_length_mm ?? 9999) > 620) {
        const f = pickShorterFuse(brand, fuses);
        if (f) {
          push({
            kind: "fuse",
            partId: f.id,
            title: f.sizeLabel,
            why: `${d}: a shorter fuse loosens the turn. You currently bottom out at ${shortest.sizeLabel}.`,
            brand,
          });
        }
      }
    }
  }

  const seed = inferSetup(doc, brand);
  if (seed && doc.level && doc.goal) {
    const next = nextSetups(seed, doc.level, doc.disciplines[0] ?? "wing", doc.goal);
    for (const r of next.slice(0, 2)) {
      if (!doc.parts.frontIds.includes(r.front.id)) {
        push({
          kind: "front",
          partId: r.front.id,
          title: `${r.front.familyOfficial} ${r.front.sizeLabel}`,
          why: `Progression (${doc.goal}): ${r.headline}`,
          brand,
        });
      }
      if (!doc.parts.fuseIds.includes(r.fuse.id)) {
        push({
          kind: "fuse",
          partId: r.fuse.id,
          title: r.fuse.sizeLabel,
          why: `Progression fuse: ${r.headline}`,
          brand,
        });
      }
      if (!doc.parts.tailIds.includes(r.tail.id)) {
        push({
          kind: "tail",
          partId: r.tail.id,
          title: `${r.tail.familyOfficial} ${r.tail.sizeLabel}`,
          why: `Progression tail: ${r.headline}`,
          brand,
        });
      }
    }
  }

  return recs.slice(0, 8);
}

function inferSetup(doc: QuiverDoc, brand: Brand): Setup | null {
  const named = doc.setups.find((s) => s.brand === brand) ?? doc.setups[0];
  if (named) {
    return { brand: named.brand, frontId: named.frontId, fuseId: named.fuseId, tailId: named.tailId };
  }
  const front = ownedFronts(doc).find((f) => f.brand === brand) ?? ownedFronts(doc)[0];
  const fuse = ownedFuses(doc).find((f) => f.brand === front?.brand) ?? ownedFuses(doc)[0];
  const tail = ownedTails(doc).find((t) => t.brand === front?.brand) ?? ownedTails(doc)[0];
  if (!front || !fuse || !tail) return null;
  if (front.brand !== fuse.brand || front.brand !== tail.brand) return null;
  return { brand: front.brand, frontId: front.id, fuseId: fuse.id, tailId: tail.id };
}

export type ConvertRow = {
  kind: "front" | "tail" | "fuse" | "mast";
  ownedId: string;
  ownedTitle: string;
  twinId: string | null;
  twinTitle: string | null;
  score: number | null;
  why: string;
};

export type ConvertInclude = {
  frontIds: string[];
  tailIds: string[];
  fuseIds: string[];
  mastIds: string[];
};

export type FrontOverlapGroup = {
  twinId: string;
  twinTitle: string;
  owned: { id: string; title: string; score: number }[];
  save: number;
};

export type ConvertBuyItem = {
  kind: ConvertRow["kind"];
  twinId: string;
  twinTitle: string;
  covers: { ownedId: string; ownedTitle: string; score: number | null }[];
  /** Goal / discipline annotation — never drops coverage of an owned part. */
  note?: string;
};

/**
 * Coverage definition (greedy set-cover of included owned parts):
 * An included owned part is covered when a selected other-brand buy lists it
 * in `covers`. Fronts are covered by their nearest twin and by any other-brand
 * front scoring ≥ FRONT_OVERLAP_MIN (same overlap collapse as the unique buy
 * list). Tails, fuses, and masts are covered by their nearest published twin.
 *
 * ~80% / ~90% tiers take the shortest greedy prefix that covers at least
 * ceil(pct/100 × included owned parts). Parts with no twin stay uncovered;
 * the tier note says so. 80% unique buys ≤ 90% unique buys by construction.
 */
export type ConvertCoverageTier = {
  pct: 80 | 90;
  items: ConvertBuyItem[];
  coveredOwned: number;
  totalOwned: number;
  note?: string;
};

export type ConvertRangeMid = {
  twinId: string;
  twinTitle: string;
  /** Tiers where this mid size is not needed to hit coverage. */
  optionalFor: (80 | 90)[];
};

/** Progressive min–max pair when a catalog family has 3+ suggested sizes. */
export type ConvertRangeSummary = {
  kind: ConvertRow["kind"];
  familyOfficial: string;
  minId: string;
  minTitle: string;
  maxId: string;
  maxTitle: string;
  mids: ConvertRangeMid[];
  note: string;
};

export type OwnedConvertPart = {
  kind: ConvertRow["kind"];
  id: string;
  title: string;
};

/** Front match at or above this is collapsed when several owned fronts share a twin. */
export const FRONT_OVERLAP_MIN = 85;

export type BrandConvert = {
  from: Brand;
  to: Brand;
  rows: ConvertRow[];
  tableRows: ConvertRow[];
  uniqueNeeded: { fronts: number; tails: number; fuses: number; masts: number; total: number };
  ownedCounts: { fronts: number; tails: number; fuses: number; masts: number };
  overlap: { fronts: number; tails: number; fuses: number; masts: number };
  overlapSaved: number;
  headline: string;
  path: { headline: string; why: string[] }[];
  buyList: ConvertBuyItem[];
  frontOverlaps: FrontOverlapGroup[];
  coverageTiers: ConvertCoverageTier[];
  rangeSummaries: ConvertRangeSummary[];
};

export function listOwnedConvertParts(doc: QuiverDoc): OwnedConvertPart[] {
  const out: OwnedConvertPart[] = [];
  for (const id of doc.parts.frontIds) {
    const p = frontById(id);
    if (p) out.push({ kind: "front", id, title: `${p.familyOfficial} ${p.sizeLabel}` });
  }
  for (const id of doc.parts.tailIds) {
    const p = tailById(id);
    if (p) out.push({ kind: "tail", id, title: `${p.familyOfficial} ${p.sizeLabel}` });
  }
  for (const id of doc.parts.fuseIds) {
    const p = fuseById(id);
    if (p) out.push({ kind: "fuse", id, title: p.sizeLabel });
  }
  for (const id of doc.parts.mastIds) {
    const p = mastById(id);
    if (p) out.push({ kind: "mast", id, title: `${p.familyOfficial} ${p.sizeLabel}` });
  }
  return out;
}

function intersectOwned(owned: string[], picked?: string[]): string[] {
  if (!picked) return owned;
  const allow = new Set(picked);
  return owned.filter((id) => allow.has(id));
}

function frontFitsDisciplines(f: FrontWing, disciplines: Discipline[]): boolean {
  if (!disciplines.length) return true;
  const lane = frontLane(f);
  return disciplines.some((d) => WANT_LANES[d].includes(lane));
}

function frontGoalRetreats(from: FrontWing, to: FrontWing, goal: Goal): boolean {
  const a0 = from.area_cm2;
  const a1 = to.area_cm2;
  const ar0 = from.aspect_ratio;
  const ar1 = to.aspect_ratio;
  if ((goal === "more-speed" || goal === "smaller-size") && a0 != null && a1 != null && a1 > a0) {
    return true;
  }
  if (goal === "more-lift" && a0 != null && a1 != null && a1 < a0) return true;
  if (goal === "more-glide" && ar0 != null && ar1 != null && ar1 < ar0) return true;
  return false;
}

function convertFrontPenalty(
  owned: FrontWing,
  twin: FrontWing | undefined,
  goal: Goal | null,
  disciplines: Discipline[],
): number {
  if (!twin) return 9;
  let p = 0;
  if (disciplines.length && !frontFitsDisciplines(twin, disciplines)) p += 2;
  if (goal && frontGoalRetreats(owned, twin, goal)) p += 1;
  return p;
}

function preferredDiscipline(doc: QuiverDoc, front?: FrontWing): Discipline {
  if (front) {
    const lane = frontLane(front);
    const hit = doc.disciplines.find((d) => WANT_LANES[d].includes(lane));
    if (hit) return hit;
  }
  return doc.disciplines[0] ?? "wing";
}

function twinFamilyOfficial(item: ConvertBuyItem): string | null {
  if (item.kind === "front") return frontById(item.twinId)?.familyOfficial ?? null;
  if (item.kind === "tail") return tailById(item.twinId)?.familyOfficial ?? null;
  if (item.kind === "fuse") return fuseById(item.twinId)?.familyOfficial ?? null;
  return mastById(item.twinId)?.familyOfficial ?? null;
}

function twinSizeLabel(item: ConvertBuyItem): string {
  if (item.kind === "front") return frontById(item.twinId)?.sizeLabel ?? item.twinTitle;
  if (item.kind === "tail") return tailById(item.twinId)?.sizeLabel ?? item.twinTitle;
  if (item.kind === "fuse") return fuseById(item.twinId)?.sizeLabel ?? item.twinTitle;
  return mastById(item.twinId)?.sizeLabel ?? item.twinTitle;
}

function twinSortKey(item: ConvertBuyItem): number {
  if (item.kind === "front") return frontById(item.twinId)?.area_cm2 ?? 0;
  if (item.kind === "tail") return tailById(item.twinId)?.area_cm2 ?? 0;
  if (item.kind === "fuse") return fuseById(item.twinId)?.fuse_length_mm ?? 0;
  return mastById(item.twinId)?.length_mm ?? 0;
}

function convertBuyNote(item: ConvertBuyItem, doc: QuiverDoc): string | undefined {
  const goal = doc.goal;
  const bits: string[] = [];
  if (item.kind === "front") {
    const twin = frontById(item.twinId);
    if (twin && doc.disciplines.length && !frontFitsDisciplines(twin, doc.disciplines)) {
      bits.push("outline sits outside ticked disciplines' usual lanes");
    }
    if (goal && twin) {
      for (const c of item.covers) {
        const owned = frontById(c.ownedId);
        if (owned && frontGoalRetreats(owned, twin, goal)) {
          bits.push(`covers ${c.ownedTitle}; not a ${goal} forward step`);
          break;
        }
      }
    }
  }
  if (item.kind === "fuse" && goal && (goal === "tighter-turns" || goal === "more-glide")) {
    const twin = fuseById(item.twinId);
    for (const c of item.covers) {
      const owned = fuseById(c.ownedId);
      if (!owned || !twin || owned.fuse_length_mm == null || twin.fuse_length_mm == null) continue;
      if (goal === "tighter-turns" && twin.fuse_length_mm > owned.fuse_length_mm) {
        bits.push("longer than the owned fuse — covers length, not a tighter-turns step");
        break;
      }
      if (goal === "more-glide" && twin.fuse_length_mm < owned.fuse_length_mm) {
        bits.push("shorter than the owned fuse — covers length, not a more-glide step");
        break;
      }
    }
  }
  return bits[0];
}

function greedySetCover(candidates: ConvertBuyItem[], ownedIds: string[]): ConvertBuyItem[] {
  const remaining = new Set(ownedIds);
  const picked: ConvertBuyItem[] = [];
  const used = new Set<string>();
  while (remaining.size) {
    let best: ConvertBuyItem | null = null;
    let bestHits: ConvertBuyItem["covers"] = [];
    let bestScore = -1;
    for (const c of candidates) {
      const key = `${c.kind}:${c.twinId}`;
      if (used.has(key)) continue;
      const hits = c.covers.filter((o) => remaining.has(o.ownedId));
      if (!hits.length) continue;
      const score = hits.reduce((s, h) => s + (h.score ?? 40), 0);
      if (hits.length > bestHits.length || (hits.length === bestHits.length && score > bestScore)) {
        best = c;
        bestHits = hits;
        bestScore = score;
      }
    }
    if (!best) break;
    used.add(`${best.kind}:${best.twinId}`);
    picked.push({ ...best, covers: bestHits });
    for (const h of bestHits) remaining.delete(h.ownedId);
  }
  return picked;
}

function snapshotCoverageTier(
  greedy: ConvertBuyItem[],
  ownedIds: string[],
  pct: 80 | 90,
  to: Brand,
): ConvertCoverageTier {
  const totalOwned = ownedIds.length;
  const target = totalOwned ? Math.ceil((pct / 100) * totalOwned) : 0;
  const items: ConvertBuyItem[] = [];
  const covered = new Set<string>();
  for (const item of greedy) {
    if (covered.size >= target) break;
    const fresh = item.covers.filter((c) => !covered.has(c.ownedId));
    if (!fresh.length) continue;
    items.push({ ...item, covers: fresh });
    for (const c of fresh) covered.add(c.ownedId);
  }
  const coveredOwned = covered.size;
  let note: string;
  if (!totalOwned) {
    note = "No checked parts to cover.";
  } else if (coveredOwned < target) {
    const actual = Math.round((coveredOwned / totalOwned) * 100);
    note = `Covered ${coveredOwned}/${totalOwned} included parts (${actual}%). Some checked items have no published ${brandName(to)} twin.`;
  } else {
    const actual = Math.round((coveredOwned / totalOwned) * 100);
    note = `Covered ${coveredOwned}/${totalOwned} included parts (${actual}%) with ${items.length} unique ${brandName(to)} buy${items.length === 1 ? "" : "s"}.`;
  }
  return { pct, items, coveredOwned, totalOwned, note };
}

function buildRangeSummaries(
  buyList: ConvertBuyItem[],
  tiers: ConvertCoverageTier[],
): ConvertRangeSummary[] {
  const groups = new Map<string, ConvertBuyItem[]>();
  for (const item of buyList) {
    const fam = twinFamilyOfficial(item);
    if (!fam) continue;
    const key = `${item.kind}:${fam}`;
    const g = groups.get(key) ?? [];
    g.push(item);
    groups.set(key, g);
  }
  const out: ConvertRangeSummary[] = [];
  for (const items of groups.values()) {
    if (items.length < 3) continue;
    const sorted = [...items].sort((a, b) => twinSortKey(a) - twinSortKey(b));
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const fam = twinFamilyOfficial(min);
    if (!min || !max || !fam) continue;
    const optionalFor = (item: ConvertBuyItem): (80 | 90)[] =>
      ([80, 90] as const).filter(
        (pct) =>
          !tiers
            .find((t) => t.pct === pct)
            ?.items.some((i) => i.kind === item.kind && i.twinId === item.twinId),
      );
    const optionalLabel = (item: ConvertBuyItem, optional: (80 | 90)[]): string | null => {
      const size = twinSizeLabel(item);
      if (optional.includes(80) && optional.includes(90)) return `${size} optional`;
      if (optional.includes(80)) return `${size} optional for 80%`;
      if (optional.includes(90)) return `${size} optional for 90%`;
      return null;
    };
    const mids: ConvertRangeMid[] = sorted.slice(1, -1).map((m) => ({
      twinId: m.twinId,
      twinTitle: m.twinTitle,
      optionalFor: optionalFor(m),
    }));
    const bits = [
      optionalLabel(min, optionalFor(min)),
      ...mids.map((m) => {
        const midItem: ConvertBuyItem = {
          kind: min.kind,
          twinId: m.twinId,
          twinTitle: m.twinTitle,
          covers: [],
        };
        return optionalLabel(midItem, m.optionalFor);
      }),
      optionalLabel(max, optionalFor(max)),
    ].filter((b): b is string => !!b);
    out.push({
      kind: min.kind,
      familyOfficial: fam,
      minId: min.twinId,
      minTitle: min.twinTitle,
      maxId: max.twinId,
      maxTitle: max.twinTitle,
      mids,
      note: `${fam} ${twinSizeLabel(min)}–${twinSizeLabel(max)} progressive pair${bits.length ? ` · ${bits.join("; ")}` : ""}`,
    });
  }
  return out;
}

export function brandConvert(doc: QuiverDoc, include?: ConvertInclude): BrandConvert | null {
  const from = majorityBrand(doc);
  const to = otherBrand(from);
  const anyOwned =
    doc.parts.frontIds.length +
      doc.parts.tailIds.length +
      doc.parts.fuseIds.length +
      doc.parts.mastIds.length >
    0;
  if (!anyOwned) return null;

  const frontIds = intersectOwned(doc.parts.frontIds, include?.frontIds);
  const tailIds = intersectOwned(doc.parts.tailIds, include?.tailIds);
  const fuseIds = intersectOwned(doc.parts.fuseIds, include?.fuseIds);
  const mastIds = intersectOwned(doc.parts.mastIds, include?.mastIds);

  const rows: ConvertRow[] = [];
  const frontHits = new Map<
    string,
    { twinId: string; twinTitle: string; score: number }[]
  >();

  for (const id of frontIds) {
    const p = frontById(id);
    if (!p) continue;
    const twins = rankFrontTwins(p, 24);
    const nearest = twins[0];
    frontHits.set(
      id,
      twins.map((t) => ({
        twinId: t.front.id,
        twinTitle: `${t.front.familyOfficial} ${t.front.sizeLabel}`,
        score: t.score,
      })),
    );
    rows.push({
      kind: "front",
      ownedId: id,
      ownedTitle: `${p.familyOfficial} ${p.sizeLabel}`,
      twinId: nearest?.front.id ?? null,
      twinTitle: nearest ? `${nearest.front.familyOfficial} ${nearest.front.sizeLabel}` : null,
      score: nearest?.score ?? null,
      why: nearest?.why[0] ?? "No published-spec twin.",
    });
  }
  for (const id of tailIds) {
    const p = tailById(id);
    if (!p) continue;
    const t = nearestTail(id);
    rows.push({
      kind: "tail",
      ownedId: id,
      ownedTitle: `${p.familyOfficial} ${p.sizeLabel}`,
      twinId: t?.id ?? null,
      twinTitle: t ? `${t.familyOfficial} ${t.sizeLabel}` : null,
      score: null,
      why: t
        ? `Same-ish tail job (${p.role} lane) on ${brandName(to)}.`
        : "No tail twin.",
    });
  }
  for (const id of fuseIds) {
    const p = fuseById(id);
    if (!p) continue;
    const t = nearestFuse(id);
    rows.push({
      kind: "fuse",
      ownedId: id,
      ownedTitle: p.sizeLabel,
      twinId: t?.id ?? null,
      twinTitle: t ? t.sizeLabel : null,
      score: null,
      why: t
        ? `Closest overall length (${p.fuse_length_mm ?? "—"} mm → ${t.fuse_length_mm ?? "—"} mm).`
        : "No fuse twin.",
    });
  }
  for (const id of mastIds) {
    const p = mastById(id);
    if (!p) continue;
    const t = nearestMast(id);
    rows.push({
      kind: "mast",
      ownedId: id,
      ownedTitle: `${p.familyOfficial} ${p.sizeLabel}`,
      twinId: t?.id ?? null,
      twinTitle: t ? `${t.familyOfficial} ${t.sizeLabel}` : null,
      score: null,
      why: t
        ? p.motorIntegrated || t.motorIntegrated
          ? `Closest length (${p.length_mm ?? "—"} → ${t.length_mm ?? "—"} mm). Motor-integrated masts are a different product even when the number matches.`
          : `Closest published length (${p.length_mm ?? "—"} → ${t.length_mm ?? "—"} mm).`
        : "No mast twin.",
    });
  }

  const owned = (kind: ConvertRow["kind"]) => rows.filter((r) => r.kind === kind).length;
  const ownedCounts = {
    fronts: owned("front"),
    tails: owned("tail"),
    fuses: owned("fuse"),
    masts: owned("mast"),
  };

  const hitByTwin = new Map<string, FrontOverlapGroup>();
  for (const r of rows.filter((row) => row.kind === "front")) {
    for (const hit of frontHits.get(r.ownedId) ?? []) {
      if (hit.score < FRONT_OVERLAP_MIN) continue;
      const g = hitByTwin.get(hit.twinId) ?? {
        twinId: hit.twinId,
        twinTitle: hit.twinTitle,
        owned: [],
        save: 0,
      };
      g.owned.push({ id: r.ownedId, title: r.ownedTitle, score: hit.score });
      hitByTwin.set(hit.twinId, g);
    }
  }
  const frontOverlaps: FrontOverlapGroup[] = [...hitByTwin.values()]
    .filter((g) => g.owned.length >= 2)
    .map((g) => ({ ...g, save: g.owned.length - 1 }))
    .sort((a, b) => b.owned.length - a.owned.length || b.save - a.save);

  const collapsedOwned = new Set(frontOverlaps.flatMap((g) => g.owned.map((o) => o.id)));
  const tableRows = rows.filter((r) => !(r.kind === "front" && collapsedOwned.has(r.ownedId)));

  const frontBuys: ConvertBuyItem[] = [];
  const uncovered = new Set(rows.filter((r) => r.kind === "front").map((r) => r.ownedId));
  const usedTwin = new Set<string>();
  while (uncovered.size) {
    let best: FrontOverlapGroup | null = null;
    let bestCover: FrontOverlapGroup["owned"] = [];
    for (const g of frontOverlaps) {
      if (usedTwin.has(g.twinId)) continue;
      const covers = g.owned.filter((o) => uncovered.has(o.id));
      if (covers.length > bestCover.length) {
        best = g;
        bestCover = covers;
      }
    }
    if (best && bestCover.length >= 2) {
      frontBuys.push({
        kind: "front",
        twinId: best.twinId,
        twinTitle: best.twinTitle,
        covers: bestCover.map((o) => ({
          ownedId: o.id,
          ownedTitle: o.title,
          score: o.score,
        })),
      });
      usedTwin.add(best.twinId);
      for (const o of bestCover) uncovered.delete(o.id);
      continue;
    }
    const leftover = rows.find((r) => r.kind === "front" && uncovered.has(r.ownedId));
    if (!leftover) break;
    if (leftover.twinId && leftover.twinTitle) {
      const existing = frontBuys.find((b) => b.twinId === leftover.twinId);
      const cover = {
        ownedId: leftover.ownedId,
        ownedTitle: leftover.ownedTitle,
        score: leftover.score,
      };
      if (existing) existing.covers.push(cover);
      else {
        frontBuys.push({
          kind: "front",
          twinId: leftover.twinId,
          twinTitle: leftover.twinTitle,
          covers: [cover],
        });
      }
    }
    uncovered.delete(leftover.ownedId);
  }

  const buyMap = new Map<string, ConvertBuyItem>();
  const kindOrder: Record<ConvertRow["kind"], number> = { front: 0, tail: 1, fuse: 2, mast: 3 };
  for (const item of frontBuys) buyMap.set(`front:${item.twinId}`, item);
  for (const r of rows) {
    if (r.kind === "front" || !r.twinId || !r.twinTitle) continue;
    const key = `${r.kind}:${r.twinId}`;
    let item = buyMap.get(key);
    if (!item) {
      item = { kind: r.kind, twinId: r.twinId, twinTitle: r.twinTitle, covers: [] };
      buyMap.set(key, item);
    }
    item.covers.push({ ownedId: r.ownedId, ownedTitle: r.ownedTitle, score: r.score });
  }
  const buyList = [...buyMap.values()]
    .sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind] || a.twinTitle.localeCompare(b.twinTitle))
    .map((item) => {
      const note = convertBuyNote(item, doc);
      return note ? { ...item, note } : item;
    });

  const ownedIds = rows.map((r) => r.ownedId);
  const greedy = greedySetCover(buyList, ownedIds);
  const coverageTiers: ConvertCoverageTier[] = [
    snapshotCoverageTier(greedy, ownedIds, 80, to),
    snapshotCoverageTier(greedy, ownedIds, 90, to),
  ];
  const rangeSummaries = buildRangeSummaries(buyList, coverageTiers);

  const uniqueOf = (kind: ConvertRow["kind"]) => buyList.filter((b) => b.kind === kind).length;
  const uniqueNeeded = {
    fronts: uniqueOf("front"),
    tails: uniqueOf("tail"),
    fuses: uniqueOf("fuse"),
    masts: uniqueOf("mast"),
    total: buyList.length,
  };
  const overlap = {
    fronts: Math.max(0, ownedCounts.fronts - uniqueNeeded.fronts),
    tails: Math.max(0, ownedCounts.tails - uniqueNeeded.tails),
    fuses: Math.max(0, ownedCounts.fuses - uniqueNeeded.fuses),
    masts: Math.max(0, ownedCounts.masts - uniqueNeeded.masts),
  };
  const overlapSaved = overlap.fronts + overlap.tails + overlap.fuses + overlap.masts;

  const bits: string[] = [];
  if (ownedCounts.fronts) {
    bits.push(
      `${ownedCounts.fronts} included ${brandName(from)} fronts map to ${uniqueNeeded.fronts} unique ${brandName(to)} twins` +
        (overlap.fronts ? ` — overlap saves ${overlap.fronts} front purchase${overlap.fronts === 1 ? "" : "s"}` : ""),
    );
  }
  if (ownedCounts.masts) {
    bits.push(
      `${ownedCounts.masts} masts → ${uniqueNeeded.masts} unique ${brandName(to)} masts` +
        (overlap.masts ? ` (save ${overlap.masts})` : ""),
    );
  }
  const headline = !rows.length
    ? `Check owned parts to include them in the ${brandName(to)} conversion`
    : bits.join(". ") ||
      `${uniqueNeeded.total} unique ${brandName(to)} parts cover the checked items`;

  const path: BrandConvert["path"] = [];
  const seed = inferSetup(doc, from);
  if (seed) {
    const src = resolveSetup(seed);
    const twins = rankTwins(seed, 8);
    const best = twins[0];
    let twin = best;
    if (src && twins.length && best) {
      const ranked = [...twins].sort((a, b) => {
        const pa = convertFrontPenalty(src.front, a.front, doc.goal, doc.disciplines);
        const pb = convertFrontPenalty(src.front, b.front, doc.goal, doc.disciplines);
        return pa - pb || b.total - a.total;
      });
      twin =
        ranked.find((t) => {
          const p = convertFrontPenalty(src.front, t.front, doc.goal, doc.disciplines);
          return p === 0 && t.total >= best.total - 8;
        }) ??
        ranked[0] ??
        best;
    }
    if (twin) {
      const pathWhy = twin.why.slice(0, 3);
      if (src && convertFrontPenalty(src.front, twin.front, doc.goal, doc.disciplines) > 0) {
        pathWhy.push(
          "Closest published-spec replacement — covering the owned setup, not a goal-forward step.",
        );
      }
      path.push({
        headline: `If you switched tomorrow, the closest complete ${brandName(to)} setup is ${twin.front.familyOfficial} ${twin.front.sizeLabel} / ${twin.fuse.sizeLabel} / ${twin.tail.familyOfficial} ${twin.tail.sizeLabel}`,
        why: pathWhy,
      });
      const recs = nextSetups(
        twin.setup,
        doc.level ?? "comfortable",
        preferredDiscipline(doc, twin.front),
        doc.goal ?? "more-speed",
      );
      for (const r of recs) {
        const why = r.why.slice(0, 3);
        if (doc.disciplines.length && !frontFitsDisciplines(r.front, doc.disciplines)) {
          why.push("Catalog step on the other brand; outline is outside ticked disciplines' usual lanes.");
        }
        path.push({
          headline: `Then on ${brandName(to)}: ${r.headline}`,
          why,
        });
      }
    }
  } else if (ownedCounts.fronts) {
    const firstId = frontIds[0];
    const first = firstId ? frontById(firstId) : undefined;
    const t = first ? nearestFront(first.id) : null;
    if (first && t) {
      path.push({
        headline: `Start the other-brand path at ${t.familyOfficial} ${t.sizeLabel}`,
        why: [
          `That's the nearest published-spec twin of ${shortFront(first)}. Add a ${brandName(to)} fuse + tail to make it a real setup.`,
        ],
      });
    }
  }

  return {
    from,
    to,
    rows,
    tableRows,
    uniqueNeeded,
    ownedCounts,
    overlap,
    overlapSaved,
    headline,
    path,
    buyList,
    frontOverlaps,
    coverageTiers,
    rangeSummaries,
  };
}

export function newNamedSetup(partial: Omit<NamedSetup, "id">): NamedSetup {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `setup-${Date.now()}`;
  return { ...partial, id };
}

export function setupToTwin(s: NamedSetup): Setup {
  return { brand: s.brand, frontId: s.frontId, fuseId: s.fuseId, tailId: s.tailId };
}
