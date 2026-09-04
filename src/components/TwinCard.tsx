import type { TwinMatch } from "../lib/match";
import { n, pct } from "../lib/format";

type Props = {
  match: TwinMatch;
  selected?: boolean;
  onSelect?: () => void;
  rank?: number;
};

function Meter({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="meter">
      <label>
        <span>{label}</span>
        <span>{value == null ? "skip" : pct(value)}</span>
      </label>
      <div className="bar">
        <i style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}

export function TwinCard({ match, selected, onSelect, rank }: Props) {
  return (
    <button
      type="button"
      className={`twin-card${selected ? " on" : ""}`}
      onClick={onSelect}
    >
      <div className="twin-top">
        <div className="twin-title">
          {rank != null ? `${rank}. ` : ""}
          {match.front.familyOfficial} {match.front.sizeLabel}
        </div>
        <div className="score">{pct(match.total)}</div>
      </div>
      <div className="pills">
        <span className="pill">
          {match.fuse.sizeLabel} · {n(match.fuse.fuse_length_mm, 0, "mm")}
        </span>
        <span className="pill">
          {match.tail.familyOfficial} {match.tail.sizeLabel}
        </span>
        <span className="pill">
          {n(match.front.area_cm2, 0, "cm²")} · AR {n(match.front.aspect_ratio, 2)}
        </span>
      </div>
      <ul className="why">
        {match.why.slice(0, 4).map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <div className="meters">
        <Meter label="Front" value={match.frontScore} />
        <Meter label="Tail" value={match.tailScore} />
        <Meter label="Fuse" value={match.fuseScore} />
      </div>
    </button>
  );
}
