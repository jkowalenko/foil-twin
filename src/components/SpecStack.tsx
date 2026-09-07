import type { FrontWing, Fuselage, TailWing } from "../data/types";
import { n } from "../lib/format";

type Props = {
  front: FrontWing;
  fuse: Fuselage;
  tail: TailWing;
};

function Row({
  k,
  v,
  nullish,
}: {
  k: string;
  v: string;
  nullish?: boolean;
}) {
  return (
    <div className="spec-row">
      <span className="k">{k}</span>
      <span className={`v${nullish ? " nullish" : ""}`}>{v}</span>
    </div>
  );
}

export function SpecStack({ front, fuse, tail }: Props) {
  const brandClass = front.brand === "armstrong" ? "part-name arm" : "part-name";
  return (
    <div className="stack">
      <div className={brandClass}>
        {front.familyOfficial} {front.sizeLabel}
      </div>
      <Row k="Area" v={n(front.area_cm2, 1, "cm²")} nullish={front.area_cm2 == null} />
      <Row k="Span" v={n(front.span_mm, 0, "mm")} />
      <Row k="Aspect ratio" v={n(front.aspect_ratio, 2)} />
      <Row k="Chord" v={n(front.chord_mm, 1, "mm")} nullish={front.chord_mm == null} />
      <Row k="Weight" v={n(front.weight_g, 0, "g")} nullish={front.weight_g == null} />
      <Row k="Construction" v={front.construction ?? "—"} nullish={!front.construction} />

      <div className={brandClass} style={{ marginTop: 6 }}>
        {fuse.familyOfficial} {fuse.sizeLabel}
      </div>
      <Row k="Length" v={n(fuse.fuse_length_mm, 0, "mm")} />
      <Row
        k="Mast vs original standard"
        v={
          fuse.mast_forward_vs_standard_mm != null
            ? `${fuse.mast_forward_vs_standard_mm} mm further forward`
            : "—"
        }
        nullish={fuse.mast_forward_vs_standard_mm == null}
      />
      <Row k="Weight" v={n(fuse.weight_g, 0, "g")} nullish />
      <Row k="Construction" v={fuse.construction ?? "—"} />

      <div className={brandClass} style={{ marginTop: 6 }}>
        {tail.familyOfficial} {tail.sizeLabel}
      </div>
      <Row k="Area" v={n(tail.area_cm2, 2, "cm²")} />
      <Row k="Span" v={n(tail.span_mm, 0, "mm")} nullish={tail.span_mm == null} />
      <Row k="Aspect ratio" v={n(tail.aspect_ratio, 2)} nullish={tail.aspect_ratio == null} />
      <Row k="Tail job" v={tail.role} />
    </div>
  );
}
