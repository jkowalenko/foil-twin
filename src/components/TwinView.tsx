import { useEffect, useMemo, useState } from "react";
import type { Brand, Setup } from "../data/types";
import { brandName, otherBrand, otherBrands, setupLabel } from "../lib/format";
import { MIN_FRONT_TWIN, groupTwinsByFront, rankTwins, resolveSetup } from "../lib/match";
import { BrandMark, BrandToggle } from "./BrandMark";
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
  const [targetBrand, setTargetBrand] = useState<Brand>(() => otherBrand(setup.brand));
  useEffect(() => {
    if (targetBrand === setup.brand) {
      setTargetBrand(otherBrand(setup.brand));
    }
  }, [setup.brand, targetBrand]);
  const twins = useMemo(
    () => rankTwins(setup, 120, { minFrontScore: MIN_FRONT_TWIN, targetBrand }),
    [setup, targetBrand],
  );
  const groups = useMemo(() => groupTwinsByFront(twins).slice(0, 8), [twins]);
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  useEffect(() => {
    setPickedKey(null);
  }, [setup.frontId, setup.fuseId, setup.tailId, targetBrand]);
  const flat = groups.flatMap((g) => [g.best, ...g.variants]);
  const active =
    flat.find(
      (t) => `${t.front.id}|${t.fuse.id}|${t.tail.id}` === pickedKey,
    ) ?? groups[0]?.best;

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel-h">
          <div>
            <h2 className="h-with-logo">
              <BrandMark brand={setup.brand} size="sm" />
              Your {brandName(setup.brand)} setup
            </h2>
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
            <h2 className="h-with-logo">
              <BrandMark brand={targetBrand} size="sm" />
              {brandName(targetBrand)} twin setups
            </h2>
            <div className="sub">
              Other-brand setups that feel closest to what you ride, grouped by front
              wing.
            </div>
          </div>
        </div>
        <div className="panel-b twin-list">
          <BrandToggle
            value={targetBrand}
            onChange={setTargetBrand}
            brands={otherBrands(setup.brand)}
            size="sm"
          />
          {groups.length === 0 && (
            <div className="empty-state">
              No close {brandName(targetBrand)} twins for this front.
              Try another size or family.
            </div>
          )}
          {groups.map((g, i) => {
            const shown =
              active && active.front.id === g.front.id ? active : g.best;
            const key = `${shown.front.id}|${shown.fuse.id}|${shown.tail.id}`;
            const selected = active?.front.id === g.front.id;
            return (
              <div key={g.front.id} className="twin-group">
                <TwinCard
                  match={shown}
                  rank={i + 1}
                  selected={selected}
                  onSelect={() => setPickedKey(key)}
                />
                {g.variants.length > 0 && (
                  <div className="twin-variants">
                    <span className="twin-variants-label">Other fuse / tail on this front</span>
                    {g.variants.map((v) => {
                      const vk = `${v.front.id}|${v.fuse.id}|${v.tail.id}`;
                      const on =
                        active?.front.id === v.front.id &&
                        active.fuse.id === v.fuse.id &&
                        active.tail.id === v.tail.id;
                      return (
                        <button
                          key={vk}
                          type="button"
                          className={`chip${on ? " on" : ""}`}
                          onClick={() => setPickedKey(vk)}
                        >
                          {v.fuse.sizeLabel} · {v.tail.familyOfficial} {v.tail.sizeLabel} ·{" "}
                          {Math.round(v.total)}%
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {active && (
            <button
              type="button"
              className="chip on"
              onClick={() => onAdopt(active.setup)}
            >
              Load this twin as the current setup
            </button>
          )}
          {twins[0] && (
            <p className="note">
              Closest other-brand parts by published size and shape — not a
              guarantee of identical feel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
