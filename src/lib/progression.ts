import { catalog, frontById } from "../data/catalog";
import type {
  Discipline,
  FrontWing,
  Fuselage,
  Goal,
  RiderLevel,
  Setup,
  TailWing,
} from "../data/types";
import { rankTwins, resolveSetup, type TwinMatch } from "./match";

export type NextSetup = {
  setup: Setup;
  front: FrontWing;
  fuse: Fuselage;
  tail: TailWing;
  headline: string;
  why: string[];
  jump: "small" | "medium" | "big";
  otherBrandTwin: TwinMatch | null;
};

function areaOf(id: string): number | null {
  return frontById(id)?.area_cm2 ?? null;
}

function jumpFromArea(from: number | null, to: number | null): NextSetup["jump"] {
  if (from == null || to == null) return "medium";
  const r = Math.abs(Math.log(to) - Math.log(from));
  if (r < Math.log(1.1)) return "small";
  if (r < Math.log(1.22)) return "medium";
  return "big";
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
  if (direction === "down") return list[i + 2] ?? list[i + 1] ?? null;
  return list[i - 2] ?? list[i - 1] ?? null;
}

type FamilyLane = "carve" | "surf" | "allround" | "glide";

function lane(f: FrontWing): FamilyLane {
  if (f.familyId === "spitfire" || f.familyId === "ma-mk2") return "carve";
  if (f.familyId === "surge") return "surf";
  if (f.familyId === "fireball" || f.familyId === "uha") return "glide";
  return "allround";
}

function familyShift(front: FrontWing, goal: Goal): FrontFamilyTarget | null {
  const map: Record<string, Partial<Record<Goal, string>>> = {
    spitfire: {
      "more-speed": "surge",
      "more-glide": "art-v2",
      "tighter-turns": "surge",
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
): FrontWing | null {
  const pool = catalog.fronts.filter((f) => f.brand === brand && f.familyId === familyId);
  if (!pool.length || area == null) return pool[0] ?? null;
  const target = bias === "down" ? area * 0.9 : bias === "up" ? area * 1.08 : area;
  return [...pool].sort(
    (a, b) =>
      Math.abs(Math.log((a.area_cm2 ?? target) / target)) -
      Math.abs(Math.log((b.area_cm2 ?? target) / target)),
  )[0];
}

function shorterFuse(current: Fuselage): Fuselage | null {
  const list = catalog.fuselages
    .filter((f) => f.brand === current.brand && f.fuse_length_mm != null)
    .sort((a, b) => (a.fuse_length_mm ?? 0) - (b.fuse_length_mm ?? 0));
  const i = list.findIndex((f) => f.id === current.id);
  if (i <= 0) return list[0] ?? null;
  return list[i - 1] ?? null;
}

function longerFuse(current: Fuselage): Fuselage | null {
  const list = catalog.fuselages
    .filter((f) => f.brand === current.brand && f.fuse_length_mm != null)
    .sort((a, b) => (a.fuse_length_mm ?? 0) - (b.fuse_length_mm ?? 0));
  const i = list.findIndex((f) => f.id === current.id);
  if (i < 0) return null;
  return list[i + 1] ?? list[i] ?? null;
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
  if (i <= 0) return list[0] ?? null;
  return list[i - 1] ?? null;
}

function disciplineTailHint(
  brand: TailWing["brand"],
  discipline: Discipline,
): TailWing["familyId"] | null {
  if (brand === "axis") {
    if (discipline === "surf" || discipline === "wake") return "skinny-surf";
    if (discipline === "downwind" || discipline === "race") return "skinny";
    return null;
  }
  if (discipline === "surf" || discipline === "wake") return "surf";
  if (discipline === "downwind" || discipline === "race") return "speed";
  return null;
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

export function nextSetups(
  current: Setup,
  level: RiderLevel,
  discipline: Discipline,
  goal: Goal,
): NextSetup[] {
  const src = resolveSetup(current);
  if (!src) return [];

  const sizeDir: "down" | "up" =
    goal === "more-lift" ? "up" : "down";
  const step =
    level === "learning" && goal !== "more-lift"
      ? neighborByArea(src.front, sizeDir)
      : level === "pushing" && (goal === "more-speed" || goal === "smaller-size")
        ? skipOne(src.front, "down")
        : neighborByArea(src.front, sizeDir);

  const ideas: { front: FrontWing; fuse: Fuselage; tail: TailWing; headline: string; why: string[] }[] =
    [];

  if (step && (goal === "smaller-size" || goal === "more-speed" || goal === "more-lift")) {
    const fuse =
      goal === "more-speed" && level !== "learning"
        ? (shorterFuse(src.fuse) ?? src.fuse)
        : goal === "more-lift"
          ? (longerFuse(src.fuse) ?? src.fuse)
          : src.fuse;
    const tail =
      goal === "more-speed"
        ? (smallerTail(src.tail) ?? src.tail)
        : goal === "more-lift"
          ? (largerTail(src.tail) ?? src.tail)
          : src.tail;
    ideas.push({
      front: step,
      fuse,
      tail,
      headline:
        goal === "more-lift"
          ? `Stay in ${step.familyOfficial}, go up to ${step.sizeLabel}`
          : `Stay in ${step.familyOfficial}, drop to ${step.sizeLabel}`,
      why: [
        goal === "more-lift"
          ? "More area → earlier lift and more low-end, less top speed."
          : "Smaller area → more speed, less lift. Same outline so the feel stays familiar.",
        fuse.id !== src.fuse.id
          ? `Fuse ${src.fuse.sizeLabel} → ${fuse.sizeLabel}.`
          : "Keep the same fuse so the jump is mostly the front wing.",
        tail.id !== src.tail.id
          ? `Tail ${src.tail.sizeLabel} → ${tail.sizeLabel}. Smaller tail = looser yaw.`
          : "Same tail family.",
        level === "learning"
          ? "Learning: one size only. Don't skip."
          : level === "pushing"
            ? "Pushing: this can feel like a real step — be honest if conditions are soft."
            : "Comfortable: one clean size change.",
      ],
    });
  }

  if (goal === "more-glide" || goal === "more-speed") {
    const shift = familyShift(src.front, goal);
    if (shift) {
      const next = closestAreaInFamily(
        shift.brand,
        shift.familyId,
        src.front.area_cm2,
        goal === "more-speed" ? "down" : "same",
      );
      if (next && next.id !== src.front.id) {
        const fuse = goal === "more-glide" ? (longerFuse(src.fuse) ?? src.fuse) : src.fuse;
        const tailFam = disciplineTailHint(src.tail.brand, discipline);
        const tail = pickTail(
          src.tail,
          tailFam,
          goal === "more-speed" ? "smaller" : "same",
        );
        ideas.push({
          front: next,
          fuse,
          tail,
          headline: `Move into ${next.familyOfficial} ${next.sizeLabel}`,
          why: [
            `Higher-AR family for ${goal === "more-glide" ? "glide" : "speed"}. ${src.front.familyOfficial} (${nAR(src.front)}) → ${next.familyOfficial} (${nAR(next)}).`,
            areaNote(src.front, next),
            next.aspect_ratio != null && src.front.aspect_ratio != null && next.aspect_ratio - src.front.aspect_ratio > 2
              ? "That's a real AR jump — less roll, more lock. Don't expect the same snap."
              : "AR change is usable, not a personality transplant.",
            discipline === "downwind" || discipline === "race"
              ? "Downwind/race: this is the intended direction."
              : discipline === "surf"
                ? "For surf, a higher-AR wing will draw longer turns. Pair a shorter fuse if you still want pivot."
                : "Wing: more glide helps through lulls; you give up some roll.",
          ],
        });
      }
    }
  }

  if (goal === "tighter-turns") {
    const fuse = shorterFuse(src.fuse) ?? src.fuse;
    const tailFam = discipline === "surf" || discipline === "wake"
      ? disciplineTailHint(src.tail.brand, discipline)
      : src.tail.familyId;
    const tail = pickTail(src.tail, tailFam, "smaller");
    const shift = familyShift(src.front, "tighter-turns");
    const nextFront =
      (shift &&
        closestAreaInFamily(shift.brand, shift.familyId, src.front.area_cm2, "same")) ||
      src.front;
    ideas.push({
      front: nextFront,
      fuse,
      tail,
      headline:
        nextFront.id === src.front.id
          ? `Same front, shorter fuse (${fuse.sizeLabel}) and a looser tail`
          : `Carve lane: ${nextFront.familyOfficial} ${nextFront.sizeLabel} + ${fuse.sizeLabel}`,
      why: [
        "Shorter fuse → more maneuverable, less pitch-stable.",
        "Smaller tail → looser yaw. Don't go tiny if you're still learning gybes.",
        nextFront.id !== src.front.id
          ? `Lower/surfier AR family (${nextFront.familyOfficial}) rolls easier than ${src.front.familyOfficial}.`
          : "Keeping the same front so you feel the fuse/tail change.",
        level === "learning"
          ? "Learning: one change at a time is kinder. This stacks fuse + tail — it's a medium jump even if the front stays."
          : "This is the surf/wake direction.",
      ],
    });
  }

  if (goal === "more-glide" && lane(src.front) === "glide") {
    const up = neighborByArea(src.front, "up");
    if (up) {
      ideas.push({
        front: up,
        fuse: longerFuse(src.fuse) ?? src.fuse,
        tail: src.tail,
        headline: `Stay high-AR, add area (${up.sizeLabel})`,
        why: [
          "You're already in the glide family. More area at similar AR is the honest next step for light days — not a smaller, even skinnier wing.",
          "A longer fuse helps pumping and tracking.",
        ],
      });
    }
  }

  // Discipline nudge: race/downwind prefer skinny/speed tails if not already.
  if ((discipline === "downwind" || discipline === "race") && goal !== "tighter-turns") {
    const hinted = disciplineTailHint(src.tail.brand, discipline);
    if (hinted && src.tail.familyId !== hinted && ideas[0]) {
      const t = pickTail(src.tail, hinted, "same");
      ideas[0] = {
        ...ideas[0],
        tail: t,
        why: [
          ...ideas[0].why,
          `${discipline}: swap toward ${t.familyOfficial} ${t.sizeLabel} for less tail drag.`,
        ],
      };
    }
  }

  const seen = new Set<string>();
  const unique = ideas.filter((idea) => {
    const key = `${idea.front.id}|${idea.fuse.id}|${idea.tail.id}`;
    if (key === `${src.front.id}|${src.fuse.id}|${src.tail.id}`) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const limit = level === "learning" ? 2 : 3;
  return unique.slice(0, limit).map((idea, i) => {
    const setup: Setup = {
      brand: current.brand,
      frontId: idea.front.id,
      fuseId: idea.fuse.id,
      tailId: idea.tail.id,
    };
    const jump = jumpFromArea(areaOf(src.front.id), areaOf(idea.front.id));
    const twin = i === 0 ? rankTwins(setup, 1)[0] ?? null : null;
    const extra =
      jump === "big"
        ? ["Honest: this is a big jump. Try it in power, not on a survival day."]
        : [];
    return {
      setup,
      front: idea.front,
      fuse: idea.fuse,
      tail: idea.tail,
      headline: idea.headline,
      why: [...idea.why, ...extra],
      jump,
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
