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
} from "./match";
import { nextSetups } from "./progression";

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

function pickShorterFuse(brand: Brand, owned: Fuselage[]): Fuselage | null {
  const pool = catalog.fuselages
    .filter((f) => f.brand === brand && f.fuse_length_mm != null)
    .sort((a, b) => (a.fuse_length_mm ?? 0) - (b.fuse_length_mm ?? 0));
  const unused = pool.filter((f) => !owned.some((o) => o.id === f.id));
  return unused[0] ?? pool[0] ?? null;
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

export type BrandConvert = {
  from: Brand;
  to: Brand;
  rows: ConvertRow[];
  uniqueNeeded: { fronts: number; tails: number; fuses: number; masts: number; total: number };
  ownedCounts: { fronts: number; tails: number; fuses: number; masts: number };
  overlap: { fronts: number; tails: number; fuses: number; masts: number };
  headline: string;
  path: { headline: string; why: string[] }[];
};

export function brandConvert(doc: QuiverDoc): BrandConvert | null {
  const from = majorityBrand(doc);
  const to = otherBrand(from);
  const rows: ConvertRow[] = [];

  for (const id of doc.parts.frontIds) {
    const p = frontById(id);
    if (!p) continue;
    const twin = rankFrontTwins(p, 1)[0];
    rows.push({
      kind: "front",
      ownedId: id,
      ownedTitle: `${p.familyOfficial} ${p.sizeLabel}`,
      twinId: twin?.front.id ?? null,
      twinTitle: twin ? `${twin.front.familyOfficial} ${twin.front.sizeLabel}` : null,
      score: twin?.score ?? null,
      why: twin?.why[0] ?? "No published-spec twin.",
    });
  }
  for (const id of doc.parts.tailIds) {
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
  for (const id of doc.parts.fuseIds) {
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
        ? `Closest overall length (${p.fuse_length_mm ?? "—"} mm → ${t.fuse_length_mm ?? "—"} mm). Tail lever still unpublished.`
        : "No fuse twin.",
    });
  }
  for (const id of doc.parts.mastIds) {
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

  const unique = (kind: ConvertRow["kind"]) =>
    new Set(rows.filter((r) => r.kind === kind && r.twinId).map((r) => r.twinId as string)).size;
  const owned = (kind: ConvertRow["kind"]) => rows.filter((r) => r.kind === kind).length;
  const uniqueNeeded = {
    fronts: unique("front"),
    tails: unique("tail"),
    fuses: unique("fuse"),
    masts: unique("mast"),
    total: unique("front") + unique("tail") + unique("fuse") + unique("mast"),
  };
  const ownedCounts = {
    fronts: owned("front"),
    tails: owned("tail"),
    fuses: owned("fuse"),
    masts: owned("mast"),
  };
  const overlap = {
    fronts: Math.max(0, ownedCounts.fronts - uniqueNeeded.fronts),
    tails: Math.max(0, ownedCounts.tails - uniqueNeeded.tails),
    fuses: Math.max(0, ownedCounts.fuses - uniqueNeeded.fuses),
    masts: Math.max(0, ownedCounts.masts - uniqueNeeded.masts),
  };

  const bits: string[] = [];
  if (ownedCounts.fronts) {
    bits.push(
      `${ownedCounts.fronts} owned ${brandName(from)} fronts map to ${uniqueNeeded.fronts} unique ${brandName(to)} twins` +
        (overlap.fronts ? ` — overlap saves ${overlap.fronts} front purchase${overlap.fronts === 1 ? "" : "s"}` : ""),
    );
  }
  if (ownedCounts.masts) {
    bits.push(
      `${ownedCounts.masts} masts → ${uniqueNeeded.masts} unique ${brandName(to)} masts` +
        (overlap.masts ? ` (save ${overlap.masts})` : ""),
    );
  }
  const headline =
    bits.join(". ") ||
    `Add some ${brandName(from)} parts first, then this will count how many unique ${brandName(to)} pieces a switch actually takes.`;

  const path: BrandConvert["path"] = [];
  const seed = inferSetup(doc, from);
  if (seed) {
    const twin = rankTwins(seed, 1)[0];
    if (twin) {
      path.push({
        headline: `If you switched tomorrow, the closest complete ${brandName(to)} setup is ${twin.front.familyOfficial} ${twin.front.sizeLabel} / ${twin.fuse.sizeLabel} / ${twin.tail.familyOfficial} ${twin.tail.sizeLabel}`,
        why: twin.why.slice(0, 3),
      });
      const recs = nextSetups(
        twin.setup,
        doc.level ?? "comfortable",
        doc.disciplines[0] ?? "wing",
        doc.goal ?? "more-speed",
      );
      for (const r of recs) {
        path.push({
          headline: `Then on ${brandName(to)}: ${r.headline}`,
          why: r.why.slice(0, 3),
        });
      }
    }
  } else if (ownedCounts.fronts) {
    const first = ownedFronts(doc)[0];
    const t = nearestFront(first.id);
    if (t) {
      path.push({
        headline: `Start the other-brand path at ${t.familyOfficial} ${t.sizeLabel}`,
        why: [
          `That's the nearest published-spec twin of ${shortFront(first)}. Add a ${brandName(to)} fuse + tail to make it a real setup.`,
        ],
      });
    }
  }

  if (!rows.length) return null;
  return { from, to, rows, uniqueNeeded, ownedCounts, overlap, headline, path };
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
