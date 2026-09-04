import { useMemo } from "react";
import type { Discipline, Goal, RiderLevel, Setup } from "../data/types";
import { brandName, n, otherBrand, setupLabel } from "../lib/format";
import { resolveSetup } from "../lib/match";
import { nextSetups } from "../lib/progression";
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

const LEVELS: { id: RiderLevel; label: string }[] = [
  { id: "learning", label: "Learning" },
  { id: "comfortable", label: "Comfortable" },
  { id: "pushing", label: "Pushing" },
];

const DISC: { id: Discipline; label: string }[] = [
  { id: "wing", label: "Wing" },
  { id: "surf", label: "Surf / prone" },
  { id: "downwind", label: "Downwind" },
  { id: "wake", label: "Wake" },
  { id: "race", label: "Race" },
];

const GOALS: { id: Goal; label: string }[] = [
  { id: "more-speed", label: "More speed" },
  { id: "more-lift", label: "More lift / low-end" },
  { id: "tighter-turns", label: "Tighter turns" },
  { id: "more-glide", label: "More glide" },
  { id: "smaller-size", label: "Smaller size" },
];

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
  const resolved = resolveSetup(setup);

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
              {DISC.map((d) => (
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
              Recommendations stay on {brandName(setup.brand)}; the top pick
              also gets the closest {brandName(otherBrand(setup.brand))} twin.
            </p>
          )}
        </div>
      </div>

      <div>
        {recs.length === 0 && (
          <div className="panel">
            <div className="panel-b">
              <p className="note">No next step from this combination — try another goal.</p>
            </div>
          </div>
        )}
        {recs.map((r, i) => (
          <article className="progress-card" key={`${r.setup.frontId}-${i}`}>
            <div className="twin-top">
              <h3>
                {i + 1}. {r.headline}
              </h3>
              <span className={`jump ${r.jump}`}>{r.jump} jump</span>
            </div>
            <div className="pills">
              <span className="pill">
                {r.front.familyOfficial} {r.front.sizeLabel} ·{" "}
                {n(r.front.area_cm2, 0, "cm²")} · AR {n(r.front.aspect_ratio, 2)}
              </span>
              <span className="pill">
                {r.fuse.sizeLabel} {n(r.fuse.fuse_length_mm, 0, "mm")}
              </span>
              <span className="pill">
                {r.tail.familyOfficial} {r.tail.sizeLabel}
              </span>
            </div>
            <ul className="why">
              {r.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <button
              type="button"
              className="chip on"
              style={{ marginTop: 10 }}
              onClick={() => onAdopt(r.setup)}
            >
              Load this as current setup
            </button>
            {r.otherBrandTwin && (
              <div style={{ marginTop: 14 }}>
                <div className="sub" style={{ marginBottom: 8, color: "var(--muted)" }}>
                  Closest {brandName(otherBrand(setup.brand))} twin of this pick
                </div>
                <TwinCard match={r.otherBrandTwin} />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
