import { useEffect, useMemo, useState } from "react";
import type { Setup } from "../data/types";
import { frontById } from "../data/catalog";
import { brandName, otherBrand, setupLabel } from "../lib/format";
import { rankTwins, resolveSetup } from "../lib/match";
import { SetupBuilder } from "./SetupBuilder";
import { SpecStack } from "./SpecStack";
import { TwinCard } from "./TwinCard";

type Props = {
  setup: Setup;
  onChange: (s: Setup) => void;
  onAdopt: (s: Setup) => void;
};

export function TwinView({ setup, onChange, onAdopt }: Props) {
  const resolved = resolveSetup(setup);
  const twins = useMemo(() => rankTwins(setup, 8), [setup]);
  const [picked, setPicked] = useState(0);
  useEffect(() => {
    setPicked(0);
  }, [setup.frontId, setup.fuseId, setup.tailId]);
  const active = twins[picked] ?? twins[0];

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel-h">
          <div>
            <h2>Your {brandName(setup.brand)} setup</h2>
            <div className="sub">{setupLabel(setup)}</div>
          </div>
        </div>
        <div className="panel-b">
          <SetupBuilder setup={setup} onChange={onChange} />
          {resolved && (
            <SpecStack
              front={resolved.front}
              fuse={resolved.fuse}
              tail={resolved.tail}
            />
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <div>
            <h2>{brandName(otherBrand(setup.brand))} twins</h2>
            <div className="sub">
              Ranked complete setups. Score is 62% front / 23% tail / 15% fuse.
            </div>
          </div>
        </div>
        <div className="panel-b twin-list">
          {twins.map((t, i) => (
            <TwinCard
              key={`${t.front.id}-${t.fuse.id}-${t.tail.id}`}
              match={t}
              rank={i + 1}
              selected={active?.front.id === t.front.id && active.fuse.id === t.fuse.id && active.tail.id === t.tail.id}
              onSelect={() => setPicked(i)}
            />
          ))}
          {active && (
            <button
              type="button"
              className="chip on arm"
              onClick={() => onAdopt(active.setup)}
            >
              Load this twin as the current setup
            </button>
          )}
          {twins[0] && (
            <p className="note">
              Front {frontById(twins[0].front.id)?.familyOfficial} is the closest
              other-brand wing by published area / span / AR. Tail role mapping:
              Skinny ≈ Speed, Progressive ≈ Dart, Skinny Surf ≈ Surf. Fuse
              matching is overall length only — Axis and Armstrong do not both
              publish tail lever.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
