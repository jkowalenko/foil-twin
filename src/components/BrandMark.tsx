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
        <span className="arm-wordmark" aria-label="Armstrong">
          <img
            className="arm-wordmark-dark"
            src="/brand/armstrong-wordmark.png?v=3"
            alt=""
            aria-hidden="true"
          />
          <img
            className="arm-wordmark-light"
            src="/brand/armstrong-wordmark-light.png?v=3"
            alt=""
            aria-hidden="true"
          />
        </span>
      )}
      {withLabel && <span className="brand-mark-label">{label}</span>}
    </span>
  );
}
