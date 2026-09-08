import { useMemo, useState } from "react";
import {
  FAMILY_COLOR,
  FAMILY_LABEL,
  FRONT_FAMILY_ORDER,
  catalog,
  frontById,
} from "../data/catalog";
import { BRANDS, type FrontFamilyId, type FrontWing } from "../data/types";
import { brandName, n, shortFront } from "../lib/format";
import { MIN_MAP_FRONT, arClass, rankFrontTwins } from "../lib/match";
import { BrandMark } from "./BrandMark";

type YMode = "ar" | "span";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUseFront: (front: FrontWing) => void;
};

export function MapView({ selectedId, onSelect, onUseFront }: Props) {
  const [yMode, setYMode] = useState<YMode>("ar");
  const [hidden, setHidden] = useState<Set<FrontFamilyId>>(new Set());
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const points = catalog.fronts.filter((f) => {
    if (hidden.has(f.familyId)) return false;
    if (f.area_cm2 == null) return false;
    if (yMode === "ar") return f.aspect_ratio != null;
    return f.span_mm != null;
  });

  const layout = useMemo(() => {
    const padL = 58;
    const padR = 18;
    const padT = 22;
    const padB = 42;
    const W = 1000;
    const H = 640;
    const areas = points.map((p) => p.area_cm2!);
    const ys = points.map((p) => (yMode === "ar" ? p.aspect_ratio! : p.span_mm!));
    const minA = Math.min(...areas);
    const maxA = Math.max(...areas);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const xOf = (area: number) => {
      const t =
        (Math.log(area) - Math.log(minA)) / (Math.log(maxA) - Math.log(minA) || 1);
      return padL + t * (W - padL - padR);
    };
    const yOf = (v: number) => {
      const t = (v - minY) / (maxY - minY || 1);
      return padT + (1 - t) * (H - padT - padB);
    };
    return { W, H, padL, padR, padT, padB, xOf, yOf, minA, maxA, minY, maxY };
  }, [points, yMode]);

  const selected = selectedId ? frontById(selectedId) : undefined;
  const hovered = hoverId ? frontById(hoverId) : undefined;
  const selectedClass = selected ? arClass(selected) : null;
  const twins = selected
    ? rankFrontTwins(selected, 5, { sameArClass: true, minScore: MIN_MAP_FRONT })
    : [];
  const twinIds = new Set(twins.map((t) => t.front.id));
  const pickerFronts = FRONT_FAMILY_ORDER.flatMap((fid) =>
    catalog.fronts.filter((f) => f.familyId === fid),
  );

  const families = FRONT_FAMILY_ORDER.filter((id) =>
    catalog.fronts.some((f) => f.familyId === id),
  );
  const familiesFor = (brand: FrontWing["brand"]) =>
    families.filter((id) => catalog.fronts.some((f) => f.familyId === id && f.brand === brand));
  const toggleFamily = (id: FrontFamilyId) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHidden(next);
  };

  const ticksX = [500, 700, 900, 1100, 1400, 1800, 2200];
  const ticksY =
    yMode === "ar" ? [6, 8, 10, 12, 14, 17, 20] : [600, 800, 1000, 1200, 1500, 1750];

  return (
    <div className="map-wrap">
      <div className="panel map-card">
        <div className="panel-h map-h">
          <div>
            <h2>Front map</h2>
            <div className="sub">Area vs {yMode === "ar" ? "aspect ratio" : "span"}</div>
          </div>
          <div className="map-controls">
            <div className="field map-picker">
              <label htmlFor="map-wing">Compare wing</label>
              <select
                id="map-wing"
                value={selectedId ?? ""}
                onChange={(e) => onSelect(e.target.value)}
              >
                <option value="" disabled>
                  Select a front
                </option>
                {pickerFronts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {brandName(f.brand)} {f.familyOfficial} {f.sizeLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="toggles">
              <button
                type="button"
                className={yMode === "ar" ? "on" : ""}
                onClick={() => setYMode("ar")}
              >
                Area × AR
              </button>
              <button
                type="button"
                className={yMode === "span" ? "on" : ""}
                onClick={() => setYMode("span")}
              >
                Area × span
              </button>
            </div>
          </div>
        </div>
        <svg
          className="map-svg"
          viewBox={`0 0 ${layout.W} ${layout.H}`}
          role="img"
          aria-label="Scatter plot of front wings"
        >
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(126,224,208,0.35)" />
              <stop offset="100%" stopColor="rgba(126,224,208,0)" />
            </radialGradient>
          </defs>
          {ticksX.map((a) => {
            const x = layout.xOf(a);
            return (
              <g key={`x${a}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={layout.padT}
                  y2={layout.H - layout.padB}
                  stroke="rgba(154,214,226,0.08)"
                />
                <text
                  x={x}
                  y={layout.H - 16}
                  fill="var(--muted)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono"
                >
                  {a}
                </text>
              </g>
            );
          })}
          {ticksY.map((v) => {
            const y = layout.yOf(v);
            return (
              <g key={`y${v}`}>
                <line
                  x1={layout.padL}
                  x2={layout.W - layout.padR}
                  y1={y}
                  y2={y}
                  stroke="rgba(154,214,226,0.08)"
                />
                <text
                  x={layout.padL - 8}
                  y={y + 4}
                  fill="var(--muted)"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="IBM Plex Mono"
                >
                  {v}
                </text>
              </g>
            );
          })}
          <text
            x={layout.W / 2}
            y={layout.H - 4}
            fill="var(--faint)"
            fontSize="11"
            textAnchor="middle"
          >
            area cm²
          </text>
          <text
            x="16"
            y={layout.H / 2}
            fill="var(--faint)"
            fontSize="11"
            transform={`rotate(-90 16 ${layout.H / 2})`}
            textAnchor="middle"
          >
            {yMode === "ar" ? "aspect ratio" : "span mm"}
          </text>

          {selected &&
            twins.map((t) => {
              if (selected.area_cm2 == null) return null;
              const y1 = yMode === "ar" ? selected.aspect_ratio : selected.span_mm;
              const y2 = yMode === "ar" ? t.front.aspect_ratio : t.front.span_mm;
              if (y1 == null || y2 == null || t.front.area_cm2 == null) return null;
              return (
                <line
                  key={`l-${t.front.id}`}
                  x1={layout.xOf(selected.area_cm2)}
                  y1={layout.yOf(y1)}
                  x2={layout.xOf(t.front.area_cm2)}
                  y2={layout.yOf(y2)}
                  stroke="rgba(233, 244, 247, 0.28)"
                  strokeDasharray="4 4"
                />
              );
            })}

          {points.map((p) => {
            const yv = yMode === "ar" ? p.aspect_ratio! : p.span_mm!;
            const cx = layout.xOf(p.area_cm2!);
            const cy = layout.yOf(yv);
            const isSel = p.id === selectedId;
            const isTwin = twinIds.has(p.id);
            return (
              <g
                key={p.id}
                className="dot"
                onClick={() => onSelect(p.id)}
                onMouseEnter={(e) => {
                  setHoverId(p.id);
                  const rect = (e.target as SVGElement)
                    .closest("svg")
                    ?.getBoundingClientRect();
                  if (rect) {
                    setTip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseMove={(e) => {
                  const rect = (e.target as SVGElement)
                    .closest("svg")
                    ?.getBoundingClientRect();
                  if (rect) {
                    setTip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseLeave={() => {
                  setHoverId(null);
                  setTip(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSelect(p.id);
                }}
                tabIndex={0}
                role="button"
              >
                {isSel && (
                  <circle
                    className="dot-halo"
                    cx={cx}
                    cy={cy}
                    r="18"
                    fill="url(#glow)"
                    pointerEvents="none"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 8 : isTwin ? 6.5 : 5}
                  fill={FAMILY_COLOR[p.familyId]}
                  stroke={
                    p.brand === "axis"
                      ? "rgba(230,57,70,0.9)"
                      : p.brand === "armstrong"
                        ? "rgba(76,201,240,0.9)"
                        : "rgba(82,183,136,0.9)"
                  }
                  strokeWidth={isSel ? 2 : 1}
                  opacity={isSel || isTwin || !selected ? 1 : 0.35}
                />
                {isSel && (
                  <text
                    className="dot-label"
                    x={cx > layout.W - 160 ? cx - 12 : cx + 12}
                    y={cy - 10}
                    fill="var(--text)"
                    fontSize="12"
                    fontFamily="Outfit"
                    textAnchor={cx > layout.W - 160 ? "end" : "start"}
                    pointerEvents="none"
                  >
                    {shortFront(p)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hovered && tip && (
          <div
            className="map-tip"
            style={{ left: tip.x + 14, top: tip.y + 10 }}
            role="tooltip"
          >
            <div className="map-tip-name">
              <BrandMark brand={hovered.brand} size="sm" />
              {shortFront(hovered)}
            </div>
            <div className="map-tip-specs">
              {n(hovered.area_cm2, 0, "cm²")} · {n(hovered.span_mm, 0, "mm")} · AR{" "}
              {n(hovered.aspect_ratio, 2)}
            </div>
          </div>
        )}
        <div className="legend">
          {BRANDS.map((brand) => (
            <div key={brand} className="legend-row">
              <BrandMark brand={brand} size="sm" />
              {familiesFor(brand).map((id) => (
                <span
                  key={id}
                  onClick={() => toggleFamily(id)}
                  style={{
                    cursor: "pointer",
                    opacity: hidden.has(id) ? 0.35 : 1,
                  }}
                >
                  <i style={{ background: FAMILY_COLOR[id] }} />
                  {FAMILY_LABEL[id]
                    .replace(/^Axis\s+/, "")
                    .replace(/^Armstrong\s+/, "")
                    .replace(/^Code\s+/, "")}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <div>
            <h2 className="h-with-logo">
              {selected && <BrandMark brand={selected.brand} size="sm" />}
              Part compare
            </h2>
            <div className="sub">Same shape class only</div>
          </div>
        </div>
        <div className="panel-b compare-front">
          {!selected && (
            <p className="note">Click a wing on the map. Axis is red-ringed, Armstrong blue, Code green.</p>
          )}
          {selected && (
            <>
              <div className="twin-title">{shortFront(selected)}</div>
              <div className="pills">
                <span className="pill">{n(selected.area_cm2, 0, "cm²")}</span>
                <span className="pill">{n(selected.span_mm, 0, "mm")}</span>
                <span className="pill">AR {n(selected.aspect_ratio, 2)}</span>
                {selectedClass && (
                  <span className="pill">{selectedClass} shape class</span>
                )}
              </div>
              {twins.length === 0 && (
                <p className="note">
                  {selectedClass == null
                    ? "No published aspect ratio, so this wing is not grouped by shape class."
                    : `No close other-brand fronts in this ${selectedClass} shape class.`}
                </p>
              )}
              {twins.map((t) => (
                <button
                  type="button"
                  className="compare-item"
                  key={t.front.id}
                  onClick={() => onSelect(t.front.id)}
                >
                  <div className="t">
                    <strong>{shortFront(t.front)}</strong>
                    <span className="score" style={{ fontSize: 14 }}>
                      {Math.round(t.score)}%
                    </span>
                  </div>
                  <div className="pills">
                    <span className="pill">{n(t.front.area_cm2, 0, "cm²")}</span>
                    <span className="pill">AR {n(t.front.aspect_ratio, 2)}</span>
                    <span className="pill">{n(t.front.span_mm, 0, "mm")}</span>
                  </div>
                  <ul className="why">
                    {t.why.slice(0, 3).map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </button>
              ))}
              <button
                type="button"
                className="chip on"
                style={{ marginTop: 8, alignSelf: "start" }}
                onClick={() => onUseFront(selected)}
              >
                Use this front in Twin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
