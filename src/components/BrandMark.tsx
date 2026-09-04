import type { Brand } from "../data/types";
import { brandName } from "../lib/format";

type Props = {
  brand: Brand;
  size?: "sm" | "md";
  withLabel?: boolean;
};

export function BrandMark({ brand, size = "sm", withLabel = false }: Props) {
  const label = brandName(brand);
  return (
    <span className={`brand-mark brand-mark-${brand} ${size}`}>
      {brand === "axis" ? (
        <img src="/brand/axis-logo.png" alt="AXIS" />
      ) : (
        <span className="arm-wordmark-chip">
          <img src="/brand/armstrong-wordmark.png" alt="Armstrong" />
        </span>
      )}
      {withLabel && <span className="brand-mark-label">{label}</span>}
    </span>
  );
}
