import { useEffect, useMemo, useState } from "react";
import { DISCIPLINES, GOALS, LEVELS } from "../data/labels";
import type { Discipline, Goal, RiderLevel, Setup } from "../data/types";
import { brandName, n, otherBrand, setupLabel } from "../lib/format";
import { resolveSetup } from "../lib/match";
import { nextSetups } from "../lib/progression";
import { BrandMark } from "./BrandMark";
import { SetupBuilder } from "./SetupBuilder";
import { TwinCard } from "./TwinCard";

type Props = {
  setup: Setup;
  onChange: (s: Setup) => void;
  onAdopt: (s: Setup) => void;
  level: RiderLevel;
  discipline: Discipline;
  goal: Goal;
  onLevel: (v: RiderLevel) => void;
  onDiscipline: (v: Discipline) => void;
  onGoal: (v: Goal) => void;
};

export function ProgressView({
  setup,
  onChange,
  onAdopt,
  level,
  discipline,
  goal,
  onLevel,
  onDiscipline,
  onGoal,
}: Props) {
  const recs = useMemo(
    () => nextSetups(setup, level, discipline, goal),
    [setup, level, discipline, goal],
  );
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    setSlide(0);
  }, [setup.frontId, setup.fuseId, setup.tailId, level, discipline, goal]);
  const resolved = resolveSetup(setup);
  const active = recs[slide] ?? recs[0];
  const last = Math.max(recs.length - 1, 0);

  return (
    <div className="grid-progress">
      <div className="panel">
        <div className="panel-h">
          <div>
            <h2>Where you are</h2>
            <div className="sub">{setupLabel(setup)}</div>
          </div>
        </div>
        <div className="panel-b">
          <SetupBuilder setup={setup} onChange={onChange} />
          <div className="field">
            <label>Rider level</label>
            <div className="chips">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`chip${level === l.id ? " on" : ""}`}
                  onClick={() => onLevel(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Discipline</label>
            <div className="chips">
              {DISCIPLINES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`chip${discipline === d.id ? " on" : ""}`}
                  onClick={() => onDiscipline(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Goal</label>
            <div className="chips">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`chip${goal === g.id ? " on" : ""}`}
                  onClick={() => onGoal(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          {resolved && (
            <p className="note">
              Heuristics: smaller area → speed / less lift. Higher AR → glide /
              less roll. Shorter fuse → looser. Smaller tail → looser yaw.
              Recommendations stay on {brandName(setup.brand)} and only move
              forward on the chosen goal — never a larger wing for speed or
              smaller size, never a smaller wing for lift, never a longer fuse
              for tighter turns, never a lower AR for glide. Up to 3, ordered
              small → bigger (fuse/tail first, then a one-size front, then a
              larger or family step if your skill allows). Learning stays on
              fuse, tail, or a tiny same-family size — no family leaps. If
              fewer strict-forward options exist, the carousel is shorter. The
              active pick also gets the closest{" "}
              {brandName(otherBrand(setup.brand))} twin.
            </p>
          )}
        </div>
      </div>

      <div>
        {recs.length === 0 && (
          <div className="panel">
            <div className="panel-b">
              <p className="note">
              No next step that strictly advances this goal from this combination
              — try another goal.
            </p>
            </div>
          </div>
        )}
        {active && (
          <article className="progress-card carousel">
            <div className="carousel-nav">
              <button
                type="button"
                className="chip"
                disabled={slide <= 0}
                onClick={() => setSlide((s) => Math.max(0, s - 1))}
              >
                Prev
              </button>
              <div className="dots" role="tablist" aria-label="Recommendations">
                {recs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dot-btn${i === slide ? " on" : ""}`}
                    aria-label={`Recommendation ${i + 1}`}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="chip"
                disabled={slide >= last}
                onClick={() => setSlide((s) => Math.min(last, s + 1))}
              >
                Next
              </button>
            </div>
            <div className="twin-top">
              <h3>
                {slide + 1} of {recs.length}. {active.headline}
              </h3>
              <span className={`jump ${active.jump}`}>
                {active.jump === "big" ? "bigger" : active.jump} step · {active.stepLabel}
              </span>
            </div>
            <div className="pills">
              <span className="pill">
                <BrandMark brand={setup.brand} size="sm" />
                {active.front.familyOfficial} {active.front.sizeLabel} ·{" "}
                {n(active.front.area_cm2, 0, "cm²")} · AR {n(active.front.aspect_ratio, 2)}
              </span>
              <span className="pill">
                {active.fuse.sizeLabel} {n(active.fuse.fuse_length_mm, 0, "mm")}
              </span>
              <span className="pill">
                {active.tail.familyOfficial} {active.tail.sizeLabel}
              </span>
            </div>
            <ul className="why">
              {active.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <button
              type="button"
              className="chip on"
              style={{ marginTop: 10 }}
              onClick={() => onAdopt(active.setup)}
            >
              Load this as current setup
            </button>
            {active.otherBrandTwin && (
              <div style={{ marginTop: 14 }}>
                <div className="sub h-with-logo" style={{ marginBottom: 8, color: "var(--muted)" }}>
                  <BrandMark brand={otherBrand(setup.brand)} size="sm" />
                  Closest {brandName(otherBrand(setup.brand))} twin of this pick
                </div>
                <TwinCard match={active.otherBrandTwin} />
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
