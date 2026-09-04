import {
  FAMILY_LABEL,
  FRONT_FAMILY_ORDER,
  TAIL_FAMILY_ORDER,
  catalog,
  fusesByBrand,
} from "../data/catalog";
import type { Brand, FrontFamilyId, Setup, TailFamilyId } from "../data/types";
import { brandName } from "../lib/format";

type Props = {
  setup: Setup;
  onChange: (next: Setup) => void;
};

export function SetupBuilder({ setup, onChange }: Props) {
  const fronts = catalog.fronts.filter((f) => f.brand === setup.brand);
  const families = FRONT_FAMILY_ORDER.filter((id) =>
    fronts.some((f) => f.familyId === id),
  );
  const currentFront = fronts.find((f) => f.id === setup.frontId) ?? fronts[0];
  const familyId = currentFront.familyId;
  const sizes = fronts.filter((f) => f.familyId === familyId);
  const fuses = fusesByBrand(setup.brand);
  const tails = catalog.tails.filter((t) => t.brand === setup.brand);
  const tailFamilies = TAIL_FAMILY_ORDER.filter((id) =>
    tails.some((t) => t.familyId === id),
  );
  const currentTail = tails.find((t) => t.id === setup.tailId) ?? tails[0];
  const tailFamily = currentTail.familyId;
  const tailSizes = tails.filter((t) => t.familyId === tailFamily);

  function setBrand(brand: Brand) {
    const nf = catalog.fronts.find((f) => f.brand === brand);
    const nu = fusesByBrand(brand)[0];
    const nt = catalog.tails.find((t) => t.brand === brand);
    if (!nf || !nu || !nt) return;
    onChange({ brand, frontId: nf.id, fuseId: nu.id, tailId: nt.id });
  }

  function setFamily(id: FrontFamilyId) {
    const nf = fronts.find((f) => f.familyId === id);
    if (nf) onChange({ ...setup, frontId: nf.id });
  }

  function setTailFamily(id: TailFamilyId) {
    const nt = tails.find((t) => t.familyId === id);
    if (nt) onChange({ ...setup, tailId: nt.id });
  }

  return (
    <div>
      <div className="brand-toggle">
        <button
          className={setup.brand === "axis" ? "on-axis" : ""}
          onClick={() => setBrand("axis")}
          type="button"
        >
          <span className="k">Ride</span>
          <span className="v">Axis</span>
        </button>
        <button
          className={setup.brand === "armstrong" ? "on-arm" : ""}
          onClick={() => setBrand("armstrong")}
          type="button"
        >
          <span className="k">Ride</span>
          <span className="v">Armstrong</span>
        </button>
      </div>

      <div className="field">
        <label>Front family</label>
        <select
          value={familyId}
          onChange={(e) => setFamily(e.target.value as FrontFamilyId)}
        >
          {families.map((id) => (
            <option key={id} value={id}>
              {FAMILY_LABEL[id]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Front size</label>
        <select
          value={setup.frontId}
          onChange={(e) => onChange({ ...setup, frontId: e.target.value })}
        >
          {sizes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.sizeLabel}
              {f.area_cm2 != null ? ` · ${f.area_cm2} cm²` : ""}
              {f.aspect_ratio != null ? ` · AR ${f.aspect_ratio}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Fuselage</label>
        <select
          value={setup.fuseId}
          onChange={(e) => onChange({ ...setup, fuseId: e.target.value })}
        >
          {fuses.map((f) => (
            <option key={f.id} value={f.id}>
              {f.sizeLabel}
              {f.fuse_length_mm != null ? ` · ${f.fuse_length_mm} mm` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Tail family</label>
        <select
          value={tailFamily}
          onChange={(e) => setTailFamily(e.target.value as TailFamilyId)}
        >
          {tailFamilies.map((id) => {
            const sample = tails.find((t) => t.familyId === id);
            return (
              <option key={id} value={id}>
                {sample?.familyOfficial ?? id}
              </option>
            );
          })}
        </select>
      </div>
      <div className="field">
        <label>Tail size</label>
        <select
          value={setup.tailId}
          onChange={(e) => onChange({ ...setup, tailId: e.target.value })}
        >
          {tailSizes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.sizeLabel}
              {t.area_cm2 != null ? ` · ${t.area_cm2} cm²` : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="note">
        Complete {brandName(setup.brand)} setup. Twin ranking uses published
        area, span, AR, fuse length, and tail role. Nulls are skipped, not
        guessed.
      </p>
    </div>
  );
}
