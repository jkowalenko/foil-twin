import {
  catalog,
  fuseById,
  frontById,
  mastById,
  tailById,
} from "../data/catalog";
import type {
  FrontWing,
  Fuselage,
  Mast,
  Setup,
  TailRole,
  TailWing,
} from "../data/types";
import {
  areaDeltaWords,
  arDeltaWords,
  fuseDeltaWords,
  fuseTitle,
  frontTitle,
  mastDeltaWords,
  otherBrand,
  spanDeltaWords,
  tailTitle,
} from "./format";

export type DimScore = {
  key: string;
  score: number | null;
  skipped: boolean;
};

export type ComponentScore = {
  score: number | null;
  parts: DimScore[];
};

export type TwinMatch = {
  setup: Setup;
  front: FrontWing;
  fuse: Fuselage;
  tail: TailWing;
  total: number;
  frontScore: number | null;
  tailScore: number | null;
  fuseScore: number | null;
  why: string[];
  skipped: string[];
};

export type FrontTwin = {
  front: FrontWing;
  score: number;
  why: string[];
  skipped: string[];
};

export type PartTwin<T> = {
  part: T;
  score: number;
  why: string[];
  skipped: string[];
};

export type TwinGroup = {
  front: FrontWing;
  best: TwinMatch;
  variants: TwinMatch[];
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** 1 at equal, 0 at `ratio` (e.g. 1.4 = 40% log-area gap). */
function logScore(a: number, b: number, ratio = 1.4): number {
  const d = Math.abs(Math.log(a) - Math.log(b));
  return clamp01(1 - d / Math.log(ratio));
}

function relScore(a: number, b: number, failAt = 0.25): number {
  const d = Math.abs(a - b) / Math.max(a, b);
  return clamp01(1 - d / failAt);
}

function absScore(a: number, b: number, failAt: number): number {
  return clamp01(1 - Math.abs(a - b) / failAt);
}

function weighted(parts: { w: number; s: number | null }[]): {
  score: number | null;
  skipped: string[];
} {
  let num = 0;
  let den = 0;
  const skipped: string[] = [];
  for (const p of parts) {
    if (p.s == null) continue;
    num += p.w * p.s;
    den += p.w;
  }
  if (den === 0) return { score: null, skipped };
  return { score: num / den, skipped };
}

export function scoreFrontPair(a: FrontWing, b: FrontWing): ComponentScore {
  const area =
    a.area_cm2 != null && b.area_cm2 != null
      ? logScore(a.area_cm2, b.area_cm2, 1.38)
      : null;
  const span =
    a.span_mm != null && b.span_mm != null
      ? relScore(a.span_mm, b.span_mm, 0.22)
      : null;
  const ar =
    a.aspect_ratio != null && b.aspect_ratio != null
      ? absScore(a.aspect_ratio, b.aspect_ratio, 3.4)
      : null;
  const { score } = weighted([
    { w: 0.5, s: area },
    { w: 0.25, s: span },
    { w: 0.25, s: ar },
  ]);
  return {
    score,
    parts: [
      { key: "area", score: area, skipped: area == null },
      { key: "span", score: span, skipped: span == null },
      { key: "aspect_ratio", score: ar, skipped: ar == null },
    ],
  };
}

const ROLE_AFFINITY: Record<TailRole, Record<TailRole, number>> = {
  speed: { speed: 1, dart: 0.42, surf: 0.32 },
  dart: { dart: 1, speed: 0.42, surf: 0.55 },
  surf: { surf: 1, dart: 0.55, speed: 0.32 },
};

export function scoreTailPair(a: TailWing, b: TailWing): ComponentScore {
  const role = ROLE_AFFINITY[a.role][b.role];
  const area =
    a.area_cm2 != null && b.area_cm2 != null
      ? logScore(a.area_cm2, b.area_cm2, 1.55)
      : null;
  const span =
    a.span_mm != null && b.span_mm != null
      ? relScore(a.span_mm, b.span_mm, 0.28)
      : null;
  const ar =
    a.aspect_ratio != null && b.aspect_ratio != null
      ? absScore(a.aspect_ratio, b.aspect_ratio, 4.5)
      : null;
  const { score } = weighted([
    { w: 0.42, s: role },
    { w: 0.32, s: area },
    { w: 0.13, s: span },
    { w: 0.13, s: ar },
  ]);
  return {
    score,
    parts: [
      { key: "role", score: role, skipped: false },
      { key: "area", score: area, skipped: area == null },
      { key: "span", score: span, skipped: span == null },
      { key: "aspect_ratio", score: ar, skipped: ar == null },
    ],
  };
}

function mastMaterialBucket(m: Mast): "alloy" | "carbon" | "motor" {
  if (m.motorIntegrated) return "motor";
  const c = (m.construction ?? "").toLowerCase();
  if (c.includes("aluminium") || c.includes("aluminum") || c.includes("alloy")) return "alloy";
  return "carbon";
}

export function scoreMastPair(a: Mast, b: Mast): ComponentScore {
  const length =
    a.length_mm != null && b.length_mm != null
      ? absScore(a.length_mm, b.length_mm, 220)
      : null;
  const thick =
    a.thickness_mm != null && b.thickness_mm != null
      ? absScore(a.thickness_mm, b.thickness_mm, 8)
      : null;
  const ba = mastMaterialBucket(a);
  const bb = mastMaterialBucket(b);
  const material =
    ba === bb ? 1 : ba === "motor" || bb === "motor" ? 0.28 : 0.42;
  const { score } = weighted([
    { w: 0.72, s: length },
    { w: 0.18, s: material },
    { w: 0.1, s: thick },
  ]);
  return {
    score,
    parts: [
      { key: "length", score: length, skipped: length == null },
      { key: "material", score: material, skipped: false },
      { key: "thickness", score: thick, skipped: thick == null },
    ],
  };
}

export function scoreFusePair(a: Fuselage, b: Fuselage): ComponentScore {
  const length =
    a.fuse_length_mm != null && b.fuse_length_mm != null
      ? absScore(a.fuse_length_mm, b.fuse_length_mm, 180)
      : null;
  const leverA = a.tail_lever_mm ?? a.mast_to_tail_mm;
  const leverB = b.tail_lever_mm ?? b.mast_to_tail_mm;
  const lever =
    leverA != null && leverB != null ? absScore(leverA, leverB, 120) : null;
  const mast =
    a.mast_to_front_mm != null && b.mast_to_front_mm != null
      ? absScore(a.mast_to_front_mm, b.mast_to_front_mm, 80)
      : null;
  const { score } = weighted([
    { w: 0.7, s: length },
    { w: 0.2, s: lever },
    { w: 0.1, s: mast },
  ]);
  return {
    score,
    parts: [
      { key: "length", score: length, skipped: length == null },
      { key: "tail_lever", score: lever, skipped: lever == null },
      { key: "mast_to_front", score: mast, skipped: mast == null },
    ],
  };
}

function whyFront(a: FrontWing, b: FrontWing): string[] {
  const bits: string[] = [];
  const area = areaDeltaWords(a.area_cm2, b.area_cm2);
  const ar = arDeltaWords(a.aspect_ratio, b.aspect_ratio);
  const span = spanDeltaWords(a.span_mm, b.span_mm);
  if (area) bits.push(area);
  if (ar) bits.push(ar);
  if (span && span !== "similar span") bits.push(span);
  if (a.familyId === "art-v2" && b.familyId === "ha") {
    bits.push("ART v2 and HA sit in the same mid-high AR all-rounder lane");
  }
  if (a.familyId === "ha" && b.familyId === "art-v2") {
    bits.push("HA and ART v2 are the closest all-round / glide-carve overlap");
  }
  if (
    (a.familyId === "fireball" && b.familyId === "uha") ||
    (a.familyId === "uha" && b.familyId === "fireball")
  ) {
    bits.push("both are the high-AR glide tools in this catalog");
  }
  if (
    (a.familyId === "spitfire" && b.familyId === "ma-mk2") ||
    (a.familyId === "ma-mk2" && b.familyId === "spitfire")
  ) {
    bits.push("both are the carve / mid-aspect tools — Spitfire is a bit lower AR");
  }
  if (
    (a.familyId === "surge" && (b.familyId === "ha" || b.familyId === "ma-mk2")) ||
    (b.familyId === "surge" && (a.familyId === "ha" || a.familyId === "ma-mk2"))
  ) {
    bits.push("Surge is Axis's surf-led ~9.5 AR wing — HA is the closest Armstrong outline, MA Mk II is the carve cousin");
  }
  return bits;
}

function whyTail(a: TailWing, b: TailWing): string[] {
  const bits: string[] = [];
  if (a.role === b.role) {
    const map: Record<TailRole, string> = {
      speed: "same tail job: Skinny ≈ Speed (low-drag, glide, locked yaw)",
      dart: "same tail job: Progressive ≈ Dart (looser yaw, quicker carve)",
      surf: "same tail job: Skinny Surf ≈ Surf (yaw control + surf roll)",
    };
    bits.push(map[a.role]);
  } else {
    bits.push(
      `different tail job (${a.familyOfficial} vs ${b.familyOfficial}) — still compared on area/span/AR`,
    );
  }
  const area = areaDeltaWords(a.area_cm2, b.area_cm2);
  if (area && area !== "same-ish area") bits.push(`tail has ${area}`);
  return bits;
}

function whyFuse(a: Fuselage, b: Fuselage): string[] {
  const bits: string[] = [];
  const len = fuseDeltaWords(a.fuse_length_mm, b.fuse_length_mm);
  if (len) bits.push(len);
  if (a.brand === "axis" && b.brand === "armstrong") {
    bits.push(
      "Axis Advance+ parks the mast 60 mm further forward than Axis Standard, so the same overall length has more tail lever — a 600 mm Crazy Short is not a 1:1 600 mm TC60 in pitch feel",
    );
  }
  if (a.brand === "armstrong" && b.brand === "axis") {
    bits.push(
      "Axis Advance+ mast sits 60 mm further forward than Axis Standard, so an Axis fuse of similar length will feel a bit looser in yaw/roll than a straight length match suggests",
    );
  }
  if (a.tail_lever_mm == null || b.tail_lever_mm == null) {
    bits.push("tail lever mm isn't published for both — length only");
  }
  return bits;
}

export function resolveSetup(s: Setup): {
  front: FrontWing;
  fuse: Fuselage;
  tail: TailWing;
} | null {
  const front = frontById(s.frontId);
  const fuse = fuseById(s.fuseId);
  const tail = tailById(s.tailId);
  if (!front || !fuse || !tail) return null;
  if (front.brand !== s.brand || fuse.brand !== s.brand || tail.brand !== s.brand) {
    return null;
  }
  return { front, fuse, tail };
}

export function rankTwins(from: Setup, limit = 8): TwinMatch[] {
  const src = resolveSetup(from);
  if (!src) return [];
  const brand = otherBrand(from.brand);
  const fronts = catalog.fronts.filter((f) => f.brand === brand);
  const fuses = catalog.fuselages.filter((f) => f.brand === brand);
  const tails = catalog.tails.filter((t) => t.brand === brand);

  const out: TwinMatch[] = [];
  for (const front of fronts) {
    const fs = scoreFrontPair(src.front, front);
    if (fs.score == null) continue;
    for (const fuse of fuses) {
      const us = scoreFusePair(src.fuse, fuse);
      for (const tail of tails) {
        const ts = scoreTailPair(src.tail, tail);
        const combo = weighted([
          { w: 0.62, s: fs.score },
          { w: 0.23, s: ts.score },
          { w: 0.15, s: us.score },
        ]);
        if (combo.score == null) continue;
        const skipped: string[] = [];
        for (const p of fs.parts) if (p.skipped) skipped.push(`front ${p.key}`);
        for (const p of ts.parts) if (p.skipped) skipped.push(`tail ${p.key}`);
        for (const p of us.parts) if (p.skipped) skipped.push(`fuse ${p.key}`);
        out.push({
          setup: { brand, frontId: front.id, fuseId: fuse.id, tailId: tail.id },
          front,
          fuse,
          tail,
          total: combo.score * 100,
          frontScore: fs.score * 100,
          tailScore: ts.score != null ? ts.score * 100 : null,
          fuseScore: us.score != null ? us.score * 100 : null,
          why: [
            ...whyFront(src.front, front).slice(0, 3),
            ...whyTail(src.tail, tail).slice(0, 2),
            ...whyFuse(src.fuse, fuse).slice(0, 2),
          ],
          skipped,
        });
      }
    }
  }
  out.sort((a, b) => b.total - a.total);
  return out.slice(0, limit);
}

export function rankFrontTwins(from: FrontWing, limit = 6): FrontTwin[] {
  const others = catalog.fronts.filter((f) => f.brand !== from.brand);
  const ranked: FrontTwin[] = [];
  for (const f of others) {
    const s = scoreFrontPair(from, f);
    if (s.score == null) continue;
    ranked.push({
      front: f,
      score: s.score * 100,
      why: whyFront(from, f),
      skipped: s.parts.filter((p) => p.skipped).map((p) => p.key),
    });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

export function rankTailTwins(from: TailWing, limit = 4): PartTwin<TailWing>[] {
  const others = catalog.tails.filter((t) => t.brand !== from.brand);
  const ranked: PartTwin<TailWing>[] = [];
  for (const t of others) {
    const s = scoreTailPair(from, t);
    if (s.score == null) continue;
    ranked.push({
      part: t,
      score: s.score * 100,
      why: whyTail(from, t),
      skipped: s.parts.filter((p) => p.skipped).map((p) => p.key),
    });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

export function rankFuseTwins(from: Fuselage, limit = 3): PartTwin<Fuselage>[] {
  const others = catalog.fuselages.filter((f) => f.brand !== from.brand);
  const ranked: PartTwin<Fuselage>[] = [];
  for (const f of others) {
    const s = scoreFusePair(from, f);
    if (s.score == null) continue;
    ranked.push({
      part: f,
      score: s.score * 100,
      why: whyFuse(from, f),
      skipped: s.parts.filter((p) => p.skipped).map((p) => p.key),
    });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

function whyMast(a: Mast, b: Mast): string[] {
  const bits: string[] = [];
  const len = mastDeltaWords(a.length_mm, b.length_mm);
  if (len) bits.push(len);
  const ba = mastMaterialBucket(a);
  const bb = mastMaterialBucket(b);
  if (ba === "motor" || bb === "motor") {
    bits.push(
      "one of these is motor-integrated — length can look close while the ride is a different product",
    );
  } else if (ba !== bb) {
    bits.push("alloy vs carbon — similar height, different flex and drag");
  } else if (ba === "carbon") {
    bits.push("both carbon; section and modulus still differ by family");
  } else {
    bits.push("both alloy masts");
  }
  if (a.thickness_mm != null && b.thickness_mm != null) {
    const d = b.thickness_mm - a.thickness_mm;
    if (Math.abs(d) >= 1.5) {
      bits.push(d < 0 ? "thinner published section" : "thicker published section");
    }
  }
  return bits;
}

export function rankMastTwins(from: Mast, limit = 4): PartTwin<Mast>[] {
  const others = catalog.masts.filter((m) => m.brand !== from.brand);
  const ranked: PartTwin<Mast>[] = [];
  for (const m of others) {
    const s = scoreMastPair(from, m);
    if (s.score == null) continue;
    ranked.push({
      part: m,
      score: s.score * 100,
      why: whyMast(from, m),
      skipped: s.parts.filter((p) => p.skipped).map((p) => p.key),
    });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
}

/** Collapse noisy complete-setup lists: one row per front, best fuse/tail first. */
export function groupTwinsByFront(matches: TwinMatch[]): TwinGroup[] {
  const byFront = new Map<string, TwinMatch[]>();
  for (const m of matches) {
    const list = byFront.get(m.front.id) ?? [];
    list.push(m);
    byFront.set(m.front.id, list);
  }
  const groups: TwinGroup[] = [];
  for (const list of byFront.values()) {
    list.sort((a, b) => b.total - a.total);
    groups.push({ front: list[0].front, best: list[0], variants: list.slice(1, 4) });
  }
  groups.sort((a, b) => b.best.total - a.best.total);
  return groups;
}

export function nearestFront(fromId: string): FrontWing | null {
  const f = frontById(fromId);
  if (!f) return null;
  return rankFrontTwins(f, 1)[0]?.front ?? null;
}

export function nearestTail(fromId: string): TailWing | null {
  const t = tailById(fromId);
  if (!t) return null;
  return rankTailTwins(t, 1)[0]?.part ?? null;
}

export function nearestFuse(fromId: string): Fuselage | null {
  const f = fuseById(fromId);
  if (!f) return null;
  return rankFuseTwins(f, 1)[0]?.part ?? null;
}

export function nearestMast(fromId: string): Mast | null {
  const m = mastById(fromId);
  if (!m) return null;
  return rankMastTwins(m, 1)[0]?.part ?? null;
}

export function describeTwin(m: TwinMatch): string {
  return `${frontTitle(m.front)} / ${fuseTitle(m.fuse)} / ${tailTitle(m.tail)}`;
}
