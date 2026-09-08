import { catalog } from "../data/catalog";
import type {
  Discipline,
  FrontWing,
  Fuselage,
  Goal,
  RiderLevel,
  Setup,
  TailFamilyId,
  TailRole,
  TailWing,
} from "../data/types";
import { rankTwins, resolveSetup, sameArClass, type TwinMatch } from "./match";

export type NextSetup = {
  setup: Setup;
  front: FrontWing;
  fuse: Fuselage;
  tail: TailWing;
  headline: string;
  why: string[];
  jump: "small" | "medium" | "big";
  /** What actually changed: fuse, tail, and/or front. */
  stepLabel: string;
  otherBrandTwin: TwinMatch | null;
};

type Pieces = { front: FrontWing; fuse: Fuselage; tail: TailWing };

type StepTier = 0 | 1 | 2 | 3;

type Idea = Pieces & {
  headline: string;
  why: string[];
  jump: NextSetup["jump"];
  stepLabel: string;
  tier: StepTier;
};

function jumpFromArea(from: number | null, to: number | null): NextSetup["jump"] {
  if (from == null || to == null) return "medium";
  const r = Math.abs(Math.log(to) - Math.log(from));
  if (r < Math.log(1.1)) return "small";
  if (r < Math.log(1.22)) return "medium";
  return "big";
}

function jumpRank(j: NextSetup["jump"]): number {
  return j === "small" ? 0 : j === "medium" ? 1 : 2;
}

function sameFamilyFronts(front: FrontWing): FrontWing[] {
  return catalog.fronts
    .filter((f) => f.brand === front.brand && f.familyId === front.familyId)
    .sort((a, b) => (b.area_cm2 ?? 0) - (a.area_cm2 ?? 0));
}

function neighborByArea(front: FrontWing, direction: "down" | "up"): FrontWing | null {
  const list = sameFamilyFronts(front);
  const i = list.findIndex((f) => f.id === front.id);
  if (i < 0) return null;
  if (direction === "down") return list[i + 1] ?? null;
  return list[i - 1] ?? null;
}

function skipOne(front: FrontWing, direction: "down" | "up"): FrontWing | null {
  const list = sameFamilyFronts(front);
  const i = list.findIndex((f) => f.id === front.id);
  if (i < 0) return null;
  if (direction === "down") return list[i + 2] ?? null;
  return list[i - 2] ?? null;
}

function sizeDistance(from: FrontWing, to: FrontWing): number | null {
  if (from.familyId !== to.familyId || from.brand !== to.brand) return null;
  const list = sameFamilyFronts(from);
  const i = list.findIndex((f) => f.id === from.id);
  const j = list.findIndex((f) => f.id === to.id);
  if (i < 0 || j < 0) return null;
  return Math.abs(i - j);
}

/**
 * Family speed / glide order from published AR lanes (MATCH_NOTES), not invented feel.
 * spitfire (carve ~7) < MA Mk II (~8) < Surge (~9.5) < ART v2 / HA (~10) < Fireball / UHA (~13).
 */
function speedFamilyRank(f: FrontWing): number {
  switch (f.familyId) {
    case "spitfire":
    case "code-x":
      return 0;
    case "ma-mk2":
      return 1;
    case "surge":
    case "code-s":
      return 2;
    case "art-v2":
    case "ha":
    case "code-kanga":
      return 3;
    case "fireball":
    case "uha":
    case "code-r":
      return 4;
    default:
      return 2;
  }
}

function carveFamilyRank(f: FrontWing): number {
  return 4 - speedFamilyRank(f);
}

function glideFamilyRank(f: FrontWing): number {
  return speedFamilyRank(f);
}

function speedTailRank(t: TailWing): number {
  if (t.role === "speed") return 2;
  if (t.role === "dart") return 1;
  return 0;
}

function carveTailRank(t: TailWing): number {
  if (t.role === "dart") return 2;
  if (t.role === "surf") return 1;
  return 0;
}

const AR_STEP = 0.15;

function violatesHardNever(from: Pieces, to: Pieces, goal: Goal): boolean {
  const a0 = from.front.area_cm2;
  const a1 = to.front.area_cm2;
  const ar0 = from.front.aspect_ratio;
  const ar1 = to.front.aspect_ratio;
  const l0 = from.fuse.fuse_length_mm;
  const l1 = to.fuse.fuse_length_mm;

  if (goal === "more-speed" || goal === "smaller-size") {
    if (a0 != null && a1 != null && a1 > a0) return true;
  }
  if (goal === "more-lift") {
    if (a0 != null && a1 != null && a1 < a0) return true;
  }
  if (goal === "tighter-turns") {
    if (l0 != null && l1 != null && l1 > l0) return true;
  }
  if (goal === "more-glide") {
    if (ar0 != null && ar1 != null && ar1 < ar0) return true;
  }
  return false;
}

function frontAdvances(from: Pieces, to: Pieces, goal: Goal): boolean {
  if (from.front.id === to.front.id) return false;
  const a0 = from.front.area_cm2;
  const a1 = to.front.area_cm2;
  const ar0 = from.front.aspect_ratio;
  const ar1 = to.front.aspect_ratio;

  if (goal === "more-speed") {
    const smaller = a0 != null && a1 != null && a1 < a0;
    const fasterFam = speedFamilyRank(to.front) > speedFamilyRank(from.front);
    return smaller || fasterFam;
  }
  if (goal === "more-lift") {
    return a0 != null && a1 != null && a1 > a0;
  }
  if (goal === "tighter-turns") {
    const lowerAr = ar0 != null && ar1 != null && ar1 < ar0 - AR_STEP;
    const moreCarve = carveFamilyRank(to.front) > carveFamilyRank(from.front);
    const smaller = a0 != null && a1 != null && a1 < a0;
    return lowerAr || moreCarve || smaller;
  }
  if (goal === "more-glide") {
    const higherAr = ar0 != null && ar1 != null && ar1 > ar0 + AR_STEP;
    const higherFam = glideFamilyRank(to.front) > glideFamilyRank(from.front);
    return higherAr || higherFam;
  }
  return a0 != null && a1 != null && a1 < a0;
}

function fuseAdvances(from: Pieces, to: Pieces, goal: Goal): boolean {
  if (from.fuse.id === to.fuse.id) return false;
  const l0 = from.fuse.fuse_length_mm;
  const l1 = to.fuse.fuse_length_mm;
  if (l0 == null || l1 == null) return false;
  if (goal === "tighter-turns") return l1 < l0;
  if (goal === "more-glide") return l1 > l0;
  return false;
}

function tailAdvances(from: Pieces, to: Pieces, goal: Goal): boolean {
  if (from.tail.id === to.tail.id) return false;
  const a0 = from.tail.area_cm2;
  const a1 = to.tail.area_cm2;
  const smaller = a0 != null && a1 != null && a1 < a0;
  const larger = a0 != null && a1 != null && a1 > a0;
  if (goal === "more-speed" || goal === "more-glide") {
    return smaller || speedTailRank(to.tail) > speedTailRank(from.tail);
  }
  if (goal === "tighter-turns") {
    return smaller || carveTailRank(to.tail) > carveTailRank(from.tail);
  }
  if (goal === "more-lift") return larger;
  return false;
}

/** True when `to` strictly advances `goal` and never reverses that goal's hard axis. */
export function isStrictForward(from: Pieces, to: Pieces, goal: Goal): boolean {
  if (
    from.front.id === to.front.id &&
    from.fuse.id === to.fuse.id &&
    from.tail.id === to.tail.id
  ) {
    return false;
  }
  if (violatesHardNever(from, to, goal)) return false;
  return frontAdvances(from, to, goal) || fuseAdvances(from, to, goal) || tailAdvances(from, to, goal);
}

function familyRetreats(from: FrontWing, to: FrontWing, goal: Goal): boolean {
  if (from.id === to.id) return false;
  if (goal === "more-speed" && speedFamilyRank(to) < speedFamilyRank(from)) return true;
  if (goal === "more-glide" && glideFamilyRank(to) < glideFamilyRank(from)) return true;
  if (goal === "tighter-turns" && carveFamilyRank(to) < carveFamilyRank(from)) return true;
  return false;
}

function familyShift(front: FrontWing, goal: Goal): FrontFamilyTarget | null {
  const map: Record<string, Partial<Record<Goal, string>>> = {
    spitfire: {
      "more-speed": "surge",
      "more-glide": "art-v2",
    },
    surge: {
      "more-speed": "art-v2",
      "more-glide": "art-v2",
      "tighter-turns": "spitfire",
    },
    "art-v2": {
      "more-speed": "fireball",
      "more-glide": "fireball",
      "tighter-turns": "surge",
      "more-lift": "spitfire",
    },
    fireball: {
      "tighter-turns": "art-v2",
      "more-lift": "art-v2",
    },
    "ma-mk2": {
      "more-speed": "ha",
      "more-glide": "ha",
    },
    ha: {
      "more-speed": "uha",
      "more-glide": "uha",
      "tighter-turns": "ma-mk2",
      "more-lift": "ma-mk2",
    },
    uha: {
      "tighter-turns": "ha",
      "more-lift": "ha",
    },
    "code-x": {
      "more-speed": "code-s",
      "more-glide": "code-s",
    },
    "code-s": {
      "more-speed": "code-r",
      "more-glide": "code-r",
      "tighter-turns": "code-x",
    },
    "code-r": {
      "tighter-turns": "code-s",
      "more-lift": "code-s",
    },
  };
  const id = map[front.familyId]?.[goal];
  if (!id) return null;
  return { familyId: id, brand: front.brand };
}

type FrontFamilyTarget = { familyId: string; brand: FrontWing["brand"] };

function closestAreaInFamily(
  brand: FrontWing["brand"],
  familyId: string,
  area: number | null,
  bias: "down" | "up" | "same",
  bound?: "never-larger" | "never-smaller",
): FrontWing | null {
  let pool = catalog.fronts.filter((f) => f.brand === brand && f.familyId === familyId);
  if (bound === "never-larger" && area != null) {
    pool = pool.filter((f) => f.area_cm2 == null || f.area_cm2 <= area);
  }
  if (bound === "never-smaller" && area != null) {
    pool = pool.filter((f) => f.area_cm2 == null || f.area_cm2 >= area);
  }
  if (!pool.length) return null;
  if (area == null) return pool[0] ?? null;
  const target = bias === "down" ? area * 0.8 : bias === "up" ? area * 1.2 : area;
  return [...pool].sort(
    (a, b) =>
      Math.abs(Math.log((a.area_cm2 ?? target) / target)) -
      Math.abs(Math.log((b.area_cm2 ?? target) / target)),
  )[0];
}

function areaBoundFor(goal: Goal): "never-larger" | "never-smaller" | undefined {
  if (goal === "more-speed" || goal === "smaller-size") return "never-larger";
  if (goal === "more-lift") return "never-smaller";
  return undefined;
}

function familyHopFront(
  front: FrontWing,
  goal: Goal,
  hops: number,
  aggression: "near" | "far",
): FrontWing | null {
  let cur = front;
  for (let h = 0; h < hops; h++) {
    const shift = familyShift(cur, goal);
    if (!shift) return null;
    const last = h === hops - 1;
    const bias: "down" | "up" | "same" =
      !last || aggression === "near"
        ? "same"
        : goal === "more-lift"
          ? "up"
          : goal === "more-glide"
            ? "same"
            : "down";
    const next = closestAreaInFamily(shift.brand, shift.familyId, cur.area_cm2, bias, areaBoundFor(goal));
    if (!next || next.id === cur.id) return null;
    cur = next;
  }
  return cur.id === front.id ? null : cur;
}

/**
 * Same-family length ladder (shortest → longest).
 * Scoped to `familyOfficial` so a brand-wide sort cannot skip a series
 * (Advance+ Short → Ultra Short → Crazy Short → Silly Short).
 */
function fuseLengthLadder(current: Fuselage): Fuselage[] {
  return catalog.fuselages
    .filter(
      (f) =>
        f.brand === current.brand &&
        f.familyOfficial === current.familyOfficial &&
        f.fuse_length_mm != null,
    )
    .sort((a, b) => (a.fuse_length_mm ?? 0) - (b.fuse_length_mm ?? 0));
}

/** Next catalog SKU one step shorter in this fuse family. Never skips a length. */
export function shorterFuse(current: Fuselage): Fuselage | null {
  const list = fuseLengthLadder(current);
  const i = list.findIndex((f) => f.id === current.id);
  if (i <= 0) return null;
  return list[i - 1] ?? null;
}

/** Next catalog SKU one step longer in this fuse family. Never skips a length. */
export function longerFuse(current: Fuselage): Fuselage | null {
  const list = fuseLengthLadder(current);
  const i = list.findIndex((f) => f.id === current.id);
  if (i < 0) return null;
  return list[i + 1] ?? null;
}

function smallerTail(current: TailWing): TailWing | null {
  const list = catalog.tails
    .filter((t) => t.brand === current.brand && t.familyId === current.familyId)
    .sort((a, b) => (b.area_cm2 ?? 0) - (a.area_cm2 ?? 0));
  const i = list.findIndex((t) => t.id === current.id);
  if (i < 0) return null;
  return list[i + 1] ?? null;
}

function largerTail(current: TailWing): TailWing | null {
  const list = catalog.tails
    .filter((t) => t.brand === current.brand && t.familyId === current.familyId)
    .sort((a, b) => (b.area_cm2 ?? 0) - (a.area_cm2 ?? 0));
  const i = list.findIndex((t) => t.id === current.id);
  if (i <= 0) return null;
  return list[i - 1] ?? null;
}

function roleFamily(brand: TailWing["brand"], role: TailRole): TailFamilyId {
  if (brand === "axis") {
    if (role === "speed") return "skinny";
    if (role === "dart") return "progressive";
    return "skinny-surf";
  }
  if (brand === "code") {
    if (role === "speed") return "code-r-tail";
    return "code-ar";
  }
  if (role === "speed") return "speed";
  if (role === "dart") return "dart";
  return "surf";
}

function pickTail(
  current: TailWing,
  familyId: TailWing["familyId"] | null,
  direction: "smaller" | "same" | "larger",
): TailWing {
  const family = familyId ?? current.familyId;
  const pool = catalog.tails.filter((t) => t.brand === current.brand && t.familyId === family);
  if (!pool.length) return current;
  const area = current.area_cm2;
  if (area == null) return pool[0];
  const target = direction === "smaller" ? area * 0.88 : direction === "larger" ? area * 1.1 : area;
  return [...pool].sort(
    (a, b) =>
      Math.abs((a.area_cm2 ?? target) - target) - Math.abs((b.area_cm2 ?? target) - target),
  )[0];
}

function goalTail(current: TailWing, goal: Goal): TailWing | null {
  if (goal === "smaller-size") return null;
  if (goal === "more-lift") return largerTail(current);
  const wantRole: TailRole = goal === "tighter-turns" ? "dart" : "speed";
  if (current.role !== wantRole) {
    const dir = goal === "tighter-turns" ? "same" : "smaller";
    const next = pickTail(current, roleFamily(current.brand, wantRole), dir);
    return next.id === current.id ? null : next;
  }
  return smallerTail(current);
}

function ideaKey(idea: Pieces): string {
  return `${idea.front.id}|${idea.fuse.id}|${idea.tail.id}`;
}

function autoHeadline(src: Pieces, idea: Pieces): string {
  if (idea.front.id !== src.front.id && idea.front.familyId === src.front.familyId) {
    const down =
      idea.front.area_cm2 != null &&
      src.front.area_cm2 != null &&
      idea.front.area_cm2 < src.front.area_cm2;
    return `Stay in ${idea.front.familyOfficial}, ${down ? "drop" : "go up"} to ${idea.front.sizeLabel}`;
  }
  if (idea.front.id !== src.front.id) {
    return `Move into ${idea.front.familyOfficial} ${idea.front.sizeLabel}`;
  }
  if (idea.fuse.id !== src.fuse.id) {
    const shorter =
      idea.fuse.fuse_length_mm != null &&
      src.fuse.fuse_length_mm != null &&
      idea.fuse.fuse_length_mm < src.fuse.fuse_length_mm;
    return `Same front, ${shorter ? "shorter" : "longer"} fuse (${idea.fuse.sizeLabel})`;
  }
  return `Same front, ${idea.tail.familyOfficial} ${idea.tail.sizeLabel}`;
}

function classify(src: Pieces, to: Pieces): Pick<Idea, "jump" | "stepLabel" | "tier"> {
  const frontChanged = src.front.id !== to.front.id;
  const fuseChanged = src.fuse.id !== to.fuse.id;
  const tailChanged = src.tail.id !== to.tail.id;
  const familyChanged = src.front.familyId !== to.front.familyId;

  if (!frontChanged) {
    const stepLabel =
      fuseChanged && tailChanged ? "fuse + tail" : fuseChanged ? "fuse" : "tail";
    return { jump: "small", stepLabel, tier: 0 };
  }

  if (familyChanged) {
    const areaJump = jumpFromArea(src.front.area_cm2, to.front.area_cm2);
    const famDelta = Math.abs(speedFamilyRank(to.front) - speedFamilyRank(src.front));
    const sameClass = sameArClass(src.front, to.front);
    const aggressive = famDelta >= 2 || (!sameClass && areaJump === "big");
    return {
      jump: "big",
      stepLabel: "front (family)",
      tier: aggressive ? 3 : 2,
    };
  }

  const steps = sizeDistance(src.front, to.front) ?? 1;
  const areaJump = jumpFromArea(src.front.area_cm2, to.front.area_cm2);
  if (steps <= 1) {
    return {
      jump: areaJump === "small" ? "small" : "medium",
      stepLabel: "front (one size)",
      tier: 1,
    };
  }
  if (steps === 2) {
    return {
      jump: areaJump === "big" ? "big" : "medium",
      stepLabel: "front (same family)",
      tier: 2,
    };
  }
  return { jump: "big", stepLabel: "front (same family)", tier: 3 };
}

function stepLead(src: Pieces, idea: Pieces, jump: NextSetup["jump"], stepLabel: string): string {
  const size = jump === "big" ? "Bigger" : jump === "medium" ? "Medium" : "Small";
  if (stepLabel === "fuse") {
    const shorter =
      idea.fuse.fuse_length_mm != null &&
      src.fuse.fuse_length_mm != null &&
      idea.fuse.fuse_length_mm < src.fuse.fuse_length_mm;
    return `${size} step — ${shorter ? "shorter" : "longer"} fuse only (${idea.fuse.sizeLabel}). Same front.`;
  }
  if (stepLabel === "tail") {
    return `${size} step — tail only (${src.tail.familyOfficial} ${src.tail.sizeLabel} → ${idea.tail.familyOfficial} ${idea.tail.sizeLabel}). Same front.`;
  }
  if (stepLabel === "fuse + tail") {
    return `${size} step — fuse and tail, same front.`;
  }
  if (stepLabel === "front (one size)") {
    return `${size} step — one size in ${idea.front.familyOfficial} (${src.front.sizeLabel} → ${idea.front.sizeLabel}).`;
  }
  if (stepLabel === "front (same family)") {
    return `${size} step — further size change in ${idea.front.familyOfficial} (${src.front.sizeLabel} → ${idea.front.sizeLabel}).`;
  }
  return `${size} step — ${idea.front.familyOfficial} family (${src.front.familyOfficial} ${src.front.sizeLabel} → ${idea.front.familyOfficial} ${idea.front.sizeLabel}).`;
}

function autoWhy(src: Pieces, idea: Pieces): string[] {
  const why: string[] = [];
  if (idea.front.id !== src.front.id) {
    why.push(
      `${src.front.familyOfficial} ${src.front.sizeLabel} → ${idea.front.familyOfficial} ${idea.front.sizeLabel}. ${areaNote(src.front, idea.front)}`,
    );
    if (idea.front.familyId !== src.front.familyId) {
      why.push(`${nAR(src.front)} → ${nAR(idea.front)}.`);
    }
  }
  if (idea.fuse.id !== src.fuse.id) {
    const shorter =
      idea.fuse.fuse_length_mm != null &&
      src.fuse.fuse_length_mm != null &&
      idea.fuse.fuse_length_mm < src.fuse.fuse_length_mm;
    why.push(
      `Fuse ${src.fuse.sizeLabel} → ${idea.fuse.sizeLabel}. ${
        shorter
          ? "Shorter fuse → more maneuverable, less pitch-stable."
          : "Longer fuse → more tracking / glide feel, less twitchy."
      }`,
    );
  }
  if (idea.tail.id !== src.tail.id) {
    const smaller =
      idea.tail.area_cm2 != null &&
      src.tail.area_cm2 != null &&
      idea.tail.area_cm2 < src.tail.area_cm2;
    const roleShift = idea.tail.role !== src.tail.role;
    why.push(
      `Tail ${src.tail.familyOfficial} ${src.tail.sizeLabel} → ${idea.tail.familyOfficial} ${idea.tail.sizeLabel}.` +
        (roleShift
          ? idea.tail.role === "dart"
            ? " Dart/progressive role → looser yaw, quicker carve."
            : idea.tail.role === "speed"
              ? " Speed/skinny role → less tail drag, more locked yaw."
              : ""
          : smaller
            ? " Smaller tail → looser yaw, a bit less drag."
            : " Larger tail → more support / pitch stability."),
    );
  }
  return why;
}

function consider(src: Pieces, pieces: Pieces, goal: Goal): Idea | null {
  if (!isStrictForward(src, pieces, goal)) return null;
  if (familyRetreats(src.front, pieces.front, goal)) return null;
  const { jump, stepLabel, tier } = classify(src, pieces);
  const extra: string[] = [];
  if (jump === "big") {
    extra.push("Honest: this is a bigger jump. Try it in power, not on a survival day.");
  }
  return {
    ...pieces,
    headline: autoHeadline(src, pieces),
    why: [stepLead(src, pieces, jump, stepLabel), ...autoWhy(src, pieces), ...extra],
    jump,
    stepLabel,
    tier,
  };
}

function frontSizeDir(goal: Goal): "down" | "up" | null {
  if (goal === "more-lift") return "up";
  if (goal === "more-speed" || goal === "smaller-size" || goal === "tighter-turns") return "down";
  return null;
}

function generateIdeas(src: Pieces, goal: Goal): Idea[] {
  const out: Idea[] = [];
  const add = (front: FrontWing, fuse: Fuselage, tail: TailWing) => {
    const idea = consider(src, { front, fuse, tail }, goal);
    if (idea) out.push(idea);
  };

  if (goal === "tighter-turns") {
    const fuse = shorterFuse(src.fuse);
    if (fuse) add(src.front, fuse, src.tail);
  }
  if (goal === "more-glide") {
    const fuse = longerFuse(src.fuse);
    if (fuse) add(src.front, fuse, src.tail);
  }

  const tail = goalTail(src.tail, goal);
  if (tail) add(src.front, src.fuse, tail);

  const dir = frontSizeDir(goal);
  if (dir) {
    const one = neighborByArea(src.front, dir);
    if (one) add(one, src.fuse, src.tail);
    const skip = skipOne(src.front, dir);
    if (skip) add(skip, src.fuse, src.tail);
  }
  if (goal === "more-glide") {
    const up = neighborByArea(src.front, "up");
    const down = neighborByArea(src.front, "down");
    if (up) add(up, src.fuse, src.tail);
    if (down) add(down, src.fuse, src.tail);
    const skipUp = skipOne(src.front, "up");
    const skipDown = skipOne(src.front, "down");
    if (skipUp) add(skipUp, src.fuse, src.tail);
    if (skipDown) add(skipDown, src.fuse, src.tail);
  }

  const near = familyHopFront(src.front, goal, 1, "near");
  if (near) add(near, src.fuse, src.tail);
  const far = familyHopFront(src.front, goal, 1, "far");
  if (far) add(far, src.fuse, src.tail);
  const hop2 = familyHopFront(src.front, goal, 2, "near");
  if (hop2) add(hop2, src.fuse, src.tail);
  const hop2far = familyHopFront(src.front, goal, 2, "far");
  if (hop2far) add(hop2far, src.fuse, src.tail);

  const merged = new Map<string, Idea>();
  for (const idea of out) merged.set(ideaKey(idea), idea);
  return [...merged.values()];
}

function changeKind(idea: Idea, src: Pieces): "fuse" | "tail" | "stack" | "front" {
  if (idea.front.id !== src.front.id) return "front";
  const fuse = idea.fuse.id !== src.fuse.id;
  const tail = idea.tail.id !== src.tail.id;
  if (fuse && tail) return "stack";
  if (fuse) return "fuse";
  return "tail";
}

function tooSimilar(picked: Idea[], idea: Idea, src: Pieces): boolean {
  if (picked.some((p) => ideaKey(p) === ideaKey(idea))) return true;
  const kind = changeKind(idea, src);
  if (kind === "fuse" || kind === "tail" || kind === "stack") {
    return picked.some((p) => changeKind(p, src) === kind);
  }
  return picked.some((p) => p.front.id === idea.front.id);
}

function skillAllows(level: RiderLevel, idea: Idea, src: Pieces): boolean {
  const familyChanged = idea.front.familyId !== src.front.familyId;
  if (level === "learning") {
    if (familyChanged) return false;
    if (idea.tier > 1) return false;
    const dist = sizeDistance(src.front, idea.front);
    if (dist != null && dist > 1) return false;
    return true;
  }
  if (level === "comfortable" && idea.tier > 2) return false;
  return true;
}

function pickLadder(src: Pieces, level: RiderLevel, ideas: Idea[]): Idea[] {
  const allowed = ideas.filter((i) => skillAllows(level, i, src));
  const byTier = (a: Idea, b: Idea) =>
    a.tier - b.tier ||
    jumpRank(a.jump) - jumpRank(b.jump) ||
    (a.stepLabel === "fuse" ? 0 : 1) - (b.stepLabel === "fuse" ? 0 : 1);

  const small = allowed.filter((i) => i.tier === 0).sort(byTier);
  const tiny = allowed.filter((i) => i.tier === 1).sort(byTier);
  const mid = allowed.filter((i) => i.tier === 2).sort((a, b) => {
    const af = a.front.familyId === src.front.familyId ? 0 : 1;
    const bf = b.front.familyId === src.front.familyId ? 0 : 1;
    return af - bf || byTier(a, b);
  });
  const big = allowed.filter((i) => i.tier === 3).sort(byTier);
  const midSame = mid.filter((i) => i.front.familyId === src.front.familyId);
  const midFam = mid.filter((i) => i.front.familyId !== src.front.familyId);

  const out: Idea[] = [];
  const takeFrom = (pool: Idea[]) => {
    if (out.length >= 3) return;
    for (const idea of pool) {
      if (tooSimilar(out, idea, src)) continue;
      out.push(idea);
      return;
    }
  };

  takeFrom(small);
  if (out.length === 0) takeFrom(tiny);

  if (level === "learning") {
    takeFrom(small);
    takeFrom(tiny);
    return out.slice(0, 3);
  }

  takeFrom(tiny);
  takeFrom(midSame);
  if (level === "pushing") {
    takeFrom(big);
    takeFrom(midFam);
  } else {
    takeFrom(midFam);
  }
  takeFrom(small);
  if (out.length === 0) {
    takeFrom(mid);
    if (level === "pushing") takeFrom(big);
  }

  return [...out]
    .sort((a, b) => a.tier - b.tier || jumpRank(a.jump) - jumpRank(b.jump))
    .slice(0, 3);
}

export function nextSetups(
  current: Setup,
  level: RiderLevel,
  _discipline: Discipline,
  goal: Goal,
): NextSetup[] {
  void _discipline;
  const src = resolveSetup(current);
  if (!src) return [];

  const picked = pickLadder(src, level, generateIdeas(src, goal));

  return picked.map((idea) => {
    const setup: Setup = {
      brand: current.brand,
      frontId: idea.front.id,
      fuseId: idea.fuse.id,
      tailId: idea.tail.id,
    };
    const twin = rankTwins(setup, 1)[0] ?? null;
    return {
      setup,
      front: idea.front,
      fuse: idea.fuse,
      tail: idea.tail,
      headline: idea.headline,
      why: idea.why,
      jump: idea.jump,
      stepLabel: idea.stepLabel,
      otherBrandTwin: twin,
    };
  });
}

function nAR(f: FrontWing): string {
  return f.aspect_ratio != null ? `AR ${f.aspect_ratio}` : "AR n/a";
}

function areaNote(from: FrontWing, to: FrontWing): string {
  const a = from.area_cm2;
  const b = to.area_cm2;
  if (a == null || b == null) return "Area comparison skipped — a published number is missing.";
  const pct = Math.round(((b - a) / a) * 100);
  if (Math.abs(pct) < 6) return "Area stays in the same band.";
  return pct > 0 ? `About ${pct}% more area.` : `About ${Math.abs(pct)}% less area.`;
}

