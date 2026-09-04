import { useEffect, useState } from "react";
import { BrandMark } from "./components/BrandMark";
import { MapView } from "./components/MapView";
import { ProgressView } from "./components/ProgressView";
import { QuiverView } from "./components/QuiverView";
import { ThemeToggle } from "./components/ThemeToggle";
import { TwinView } from "./components/TwinView";
import { catalog, fusesByBrand } from "./data/catalog";
import { SETUP_STORAGE_KEY } from "./data/labels";
import type { Discipline, FrontWing, Goal, RiderLevel, Setup } from "./data/types";
import { applyTheme, readTheme, type Theme } from "./lib/theme";

type View = "map" | "twin" | "progress" | "quiver";

function viewFromHash(): View {
  const h = window.location.hash.replace("#", "");
  if (h === "map" || h === "twin" || h === "progress" || h === "quiver") return h;
  return "twin";
}

const DEFAULT: Setup = {
  brand: "axis",
  frontId: "axis-artv2-879",
  fuseId: "axis-advplus-ultrashort",
  tailId: "axis-skinny-360-45",
};

function loadSetup(): Setup {
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Setup;
    const ok =
      catalog.fronts.some((f) => f.id === parsed.frontId && f.brand === parsed.brand) &&
      catalog.fuselages.some((f) => f.id === parsed.fuseId && f.brand === parsed.brand) &&
      catalog.tails.some((t) => t.id === parsed.tailId && t.brand === parsed.brand);
    return ok ? parsed : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [setup, setSetup] = useState<Setup>(loadSetup);
  const [mapFront, setMapFront] = useState<string>("axis-artv2-879");
  const [level, setLevel] = useState<RiderLevel>("comfortable");
  const [discipline, setDiscipline] = useState<Discipline>("wing");
  const [goal, setGoal] = useState<Goal>("more-speed");
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(setup));
  }, [setup]);

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = view;
    return () => window.removeEventListener("hashchange", onHash);
  }, [view]);

  function go(next: View) {
    window.location.hash = next;
    setView(next);
  }

  function useFront(front: FrontWing) {
    const fuse =
      setup.brand === front.brand
        ? setup.fuseId
        : (fusesByBrand(front.brand)[0]?.id ?? setup.fuseId);
    const tail =
      setup.brand === front.brand
        ? setup.tailId
        : (catalog.tails.find((t) => t.brand === front.brand)?.id ?? setup.tailId);
    setSetup({ brand: front.brand, frontId: front.id, fuseId: fuse, tailId: tail });
    go("twin");
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <div className="wordmark">
            <span className="axis">Foil</span> <span className="arm">Twin</span>
          </div>
          <div className="tag-row">
            <BrandMark brand="axis" size="sm" />
            <span className="tag">↔</span>
            <BrandMark brand="armstrong" size="sm" />
            <span className="tag">setup matcher</span>
          </div>
        </div>
        <div className="top-right">
          <nav className="nav" aria-label="Primary">
            <button
              type="button"
              className={view === "map" ? "active" : ""}
              onClick={() => go("map")}
            >
              Map
            </button>
            <button
              type="button"
              className={view === "twin" ? "active" : ""}
              onClick={() => go("twin")}
            >
              Twin
            </button>
            <button
              type="button"
              className={view === "progress" ? "active" : ""}
              onClick={() => go("progress")}
            >
              Progress
            </button>
            <button
              type="button"
              className={view === "quiver" ? "active" : ""}
              onClick={() => go("quiver")}
            >
              Quiver
            </button>
          </nav>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="stage">
        {view === "map" && (
          <MapView
            selectedId={mapFront}
            onSelect={setMapFront}
            onUseFront={useFront}
          />
        )}
        {view === "twin" && (
          <TwinView setup={setup} onChange={setSetup} onAdopt={setSetup} />
        )}
        {view === "progress" && (
          <ProgressView
            setup={setup}
            onChange={setSetup}
            onAdopt={setSetup}
            level={level}
            discipline={discipline}
            goal={goal}
            onLevel={setLevel}
            onDiscipline={setDiscipline}
            onGoal={setGoal}
          />
        )}
        {view === "quiver" && <QuiverView onAdopt={setSetup} />}
      </main>

      <footer className="disclaimer">
        <span>
          Specs from Axis and Armstrong product pages. Wings/fuses {catalog.retrieved}; masts{" "}
          {catalog.mastRetrieved}.
          Feel still varies by mast, board, rider weight, and conditions. Null
          numbers are unpublished — matching skips them instead of guessing.
        </span>
        <span>
          <a href="https://www.axisfoils.com" target="_blank" rel="noreferrer">
            axisfoils.com
          </a>
          {" · "}
          <a href="https://www.armstrongfoils.com" target="_blank" rel="noreferrer">
            armstrongfoils.com
          </a>
        </span>
      </footer>
    </div>
  );
}
