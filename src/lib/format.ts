import type { Brand, FrontWing, Fuselage, Mast, Setup, TailWing } from "../data/types";
import { fuseById, frontById, mastById, tailById } from "../data/catalog";

export function n(value: number | null | undefined, digits = 0, unit = ""): string {
  if (value == null || Number.isNaN(value)) return "—";
  const s =
    digits === 0
      ? Math.round(value).toString()
      : value.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  return unit ? `${s} ${unit}` : s;
}

export function brandName(brand: Brand): string {
  return brand === "axis" ? "Axis" : "Armstrong";
}

export function otherBrand(brand: Brand): Brand {
  return brand === "axis" ? "armstrong" : "axis";
}

export function frontTitle(f: FrontWing): string {
  return `${brandName(f.brand)} ${f.familyOfficial} ${f.sizeLabel}`;
}

export function tailTitle(t: TailWing): string {
  return `${brandName(t.brand)} ${t.familyOfficial} ${t.sizeLabel}`;
}

export function fuseTitle(f: Fuselage): string {
  return `${brandName(f.brand)} ${f.sizeLabel}`;
}

export function mastTitle(m: Mast): string {
  return `${brandName(m.brand)} ${m.familyOfficial} ${m.sizeLabel}`;
}

export function shortMast(m: Mast): string {
  return `${m.familyOfficial} ${m.sizeLabel}`;
}

export function partByIdTitle(kind: "front" | "tail" | "fuse" | "mast", id: string): string {
  if (kind === "front") {
    const f = frontById(id);
    return f ? frontTitle(f) : id;
  }
  if (kind === "tail") {
    const t = tailById(id);
    return t ? tailTitle(t) : id;
  }
  if (kind === "fuse") {
    const f = fuseById(id);
    return f ? fuseTitle(f) : id;
  }
  const m = mastById(id);
  return m ? mastTitle(m) : id;
}

export function setupLabel(s: Setup): string {
  const front = frontById(s.frontId);
  const fuse = fuseById(s.fuseId);
  const tail = tailById(s.tailId);
  if (!front || !fuse || !tail) return "Incomplete setup";
  return `${front.familyOfficial} ${front.sizeLabel} · ${fuse.sizeLabel} · ${tail.familyOfficial} ${tail.sizeLabel}`;
}

export function shortFront(f: FrontWing): string {
  return `${f.familyOfficial} ${f.sizeLabel}`;
}

export function pct(value: number): string {
  return `${Math.round(value)}%`;
}

export function areaDeltaWords(from: number | null, to: number | null): string | null {
  if (from == null || to == null) return null;
  const r = to / from;
  if (r > 1.18) return "noticeably more area (more lift, slower)";
  if (r > 1.08) return "a bit more area";
  if (r > 0.93) return "same-ish area";
  if (r > 0.85) return "a bit less area (quicker, less lift)";
  return "clearly less area (more speed, less low-end)";
}

export function arDeltaWords(from: number | null, to: number | null): string | null {
  if (from == null || to == null) return null;
  const d = to - from;
  if (d > 2.2) return "much higher AR — more glide, less roll";
  if (d > 0.7) return "higher AR so more glide";
  if (d > 0.25) return "slightly higher AR";
  if (d > -0.25) return "similar aspect ratio";
  if (d > -0.7) return "slightly lower AR";
  if (d > -2.2) return "lower AR so more roll / carve";
  return "much lower AR — looser roll, less glide";
}

export function spanDeltaWords(from: number | null, to: number | null): string | null {
  if (from == null || to == null) return null;
  const d = to - from;
  if (d > 80) return "longer span";
  if (d > 25) return "a bit more span";
  if (d > -25) return "similar span";
  if (d > -80) return "a bit less span";
  return "shorter span";
}

export function fuseDeltaWords(from: number | null, to: number | null): string | null {
  if (from == null || to == null) return null;
  const d = to - from;
  if (d > 80) return "longer fuse so more pitch-stable";
  if (d > 25) return "a slightly longer fuse";
  if (d > -25) return "similar overall fuse length";
  if (d > -80) return "a slightly shorter fuse so looser";
  return "shorter fuse so looser / more pivot";
}

export function mastDeltaWords(from: number | null, to: number | null): string | null {
  if (from == null || to == null) return null;
  const d = to - from;
  if (d > 120) return "noticeably taller mast";
  if (d > 40) return "a bit taller";
  if (d > -40) return "similar mast length";
  if (d > -120) return "a bit shorter";
  return "noticeably shorter mast";
}
